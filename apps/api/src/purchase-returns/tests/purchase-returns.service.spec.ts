import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Prisma, PurchaseReturnStatus } from "@prisma/client";
import {
  PurchaseReturnOverQuantityError,
  PurchaseReturnReceiptUnavailableError,
  PurchaseReturnStockRejectedError,
  PurchaseReturnsRepository,
} from "../purchase-returns.repository";
import { PurchaseReturnsService } from "../purchase-returns.service";

describe("PurchaseReturnsService", () => {
  let repository: jest.Mocked<PurchaseReturnsRepository>;
  let service: PurchaseReturnsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const returnId = "20000000-0000-4000-8000-000000000001";
  const receiptId = "30000000-0000-4000-8000-000000000001";
  const receiptLineId = "40000000-0000-4000-8000-000000000001";
  const inventoryItemId = "50000000-0000-4000-8000-000000000001";

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(purchaseReturn()),
      update: jest.fn().mockResolvedValue(purchaseReturn()),
      findById: jest.fn().mockResolvedValue(purchaseReturn()),
      findByWorkspace: jest.fn().mockResolvedValue([]),
      addLine: jest.fn().mockResolvedValue(purchaseReturn(undefined, [line()])),
      updateLine: jest.fn().mockResolvedValue(purchaseReturn(undefined, [line()])),
      confirm: jest
        .fn()
        .mockResolvedValue(
          purchaseReturn(PurchaseReturnStatus.RETURNED, [line()]),
        ),
      cancel: jest
        .fn()
        .mockResolvedValue(purchaseReturn(PurchaseReturnStatus.CANCELLED)),
    } as unknown as jest.Mocked<PurchaseReturnsRepository>;
    service = new PurchaseReturnsService(repository);
  });

  it("creates a normalized draft return", async () => {
    await service.create(workspaceId, {
      number: " pret-001 ",
      purchaseReceiptId: receiptId,
      reason: "Damaged",
    });

    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      number: "PRET-001",
      purchaseReceiptId: receiptId,
      reason: "Damaged",
    });
  });

  it("rejects a non-confirmed receipt", async () => {
    repository.create.mockRejectedValueOnce(
      new PurchaseReturnReceiptUnavailableError(),
    );

    await expect(
      service.create(workspaceId, {
        number: "PRET-001",
        purchaseReceiptId: receiptId,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("adds a positive Decimal quantity", async () => {
    await service.addLine(workspaceId, returnId, lineDto());

    expect(repository.addLine).toHaveBeenCalledWith({
      workspaceId,
      purchaseReturnId: returnId,
      purchaseReceiptLineId: receiptLineId,
      inventoryItemId,
      quantity: new Prisma.Decimal(2.5),
      reason: "Damaged",
    });
  });

  it("rejects a zero quantity outside DTO validation", async () => {
    await expect(
      service.addLine(workspaceId, returnId, {
        ...lineDto(),
        quantity: 0,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.addLine).not.toHaveBeenCalled();
  });

  it("maps a cumulative over-return to a bad request", async () => {
    repository.addLine.mockRejectedValueOnce(
      new PurchaseReturnOverQuantityError(),
    );

    await expect(
      service.addLine(workspaceId, returnId, lineDto()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("updates a draft line with a Decimal quantity", async () => {
    await service.updateLine(
      workspaceId,
      returnId,
      line().id,
      lineDto(),
    );

    expect(repository.updateLine).toHaveBeenCalledWith(
      workspaceId,
      returnId,
      line().id,
      {
        purchaseReceiptLineId: receiptLineId,
        inventoryItemId,
        quantity: new Prisma.Decimal(2.5),
        reason: "Damaged",
      },
    );
  });

  it("keeps returned returns immutable", async () => {
    repository.findById.mockResolvedValueOnce(
      purchaseReturn(PurchaseReturnStatus.RETURNED, [line()]),
    );

    await expect(
      service.update(workspaceId, returnId, { notes: "Changed" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("refuses to confirm an empty return", async () => {
    await expect(service.confirm(workspaceId, returnId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.confirm).not.toHaveBeenCalled();
  });

  it("confirms a draft return with lines", async () => {
    repository.findById.mockResolvedValueOnce(purchaseReturn(undefined, [line()]));

    const result = await service.confirm(workspaceId, returnId);

    expect(result.status).toBe(PurchaseReturnStatus.RETURNED);
    expect(repository.confirm).toHaveBeenCalledWith(workspaceId, returnId);
  });

  it("maps insufficient available stock to a bad request", async () => {
    repository.findById.mockResolvedValueOnce(purchaseReturn(undefined, [line()]));
    repository.confirm.mockRejectedValueOnce(
      new PurchaseReturnStockRejectedError(),
    );

    await expect(service.confirm(workspaceId, returnId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("prevents cancellation after confirmation", async () => {
    repository.findById.mockResolvedValueOnce(
      purchaseReturn(PurchaseReturnStatus.RETURNED, [line()]),
    );

    await expect(service.cancel(workspaceId, returnId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.cancel).not.toHaveBeenCalled();
  });

  it("preserves workspace isolation when loading a return", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.get(workspaceId, returnId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.findById).toHaveBeenCalledWith(workspaceId, returnId);
  });

  function lineDto() {
    return {
      purchaseReceiptLineId: receiptLineId,
      inventoryItemId,
      quantity: 2.5,
      reason: "Damaged",
    };
  }

  function line() {
    return {
      id: "60000000-0000-4000-8000-000000000001",
      workspaceId,
      purchaseReturnId: returnId,
      purchaseReceiptLineId: receiptLineId,
      inventoryItemId,
      quantity: new Prisma.Decimal(2.5),
      reason: "Damaged",
      createdAt: new Date("2026-08-10T00:00:00.000Z"),
      updatedAt: new Date("2026-08-10T00:00:00.000Z"),
    };
  }

  function purchaseReturn(
    status: PurchaseReturnStatus = PurchaseReturnStatus.DRAFT,
    lines: ReturnType<typeof line>[] = [],
  ) {
    return {
      id: returnId,
      workspaceId,
      number: "PRET-001",
      purchaseReceiptId: receiptId,
      status,
      reason: null,
      notes: null,
      returnedAt:
        status === PurchaseReturnStatus.RETURNED
          ? new Date("2026-08-10T01:00:00.000Z")
          : null,
      createdAt: new Date("2026-08-10T00:00:00.000Z"),
      updatedAt: new Date("2026-08-10T00:00:00.000Z"),
      lines,
    };
  }
});
