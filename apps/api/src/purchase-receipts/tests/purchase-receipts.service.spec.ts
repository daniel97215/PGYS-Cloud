import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Prisma, PurchaseReceiptStatus } from "@prisma/client";
import {
  PurchaseReceiptOrderUnavailableError,
  PurchaseReceiptOverQuantityError,
  PurchaseReceiptsRepository,
} from "../purchase-receipts.repository";
import { PurchaseReceiptsService } from "../purchase-receipts.service";

describe("PurchaseReceiptsService", () => {
  let repository: jest.Mocked<PurchaseReceiptsRepository>;
  let service: PurchaseReceiptsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const receiptId = "20000000-0000-4000-8000-000000000001";
  const orderId = "30000000-0000-4000-8000-000000000001";
  const orderLineId = "40000000-0000-4000-8000-000000000001";
  const inventoryItemId = "50000000-0000-4000-8000-000000000001";
  const warehouseId = "60000000-0000-4000-8000-000000000001";

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(receipt()),
      update: jest.fn().mockResolvedValue(receipt()),
      findById: jest.fn().mockResolvedValue(receipt()),
      findByWorkspace: jest.fn().mockResolvedValue([]),
      addLine: jest.fn().mockResolvedValue(receipt()),
      updateLine: jest.fn().mockResolvedValue(receipt()),
      confirm: jest
        .fn()
        .mockResolvedValue(receipt(PurchaseReceiptStatus.RECEIVED, [line()])),
      cancel: jest
        .fn()
        .mockResolvedValue(receipt(PurchaseReceiptStatus.CANCELLED)),
    } as unknown as jest.Mocked<PurchaseReceiptsRepository>;
    service = new PurchaseReceiptsService(repository);
  });

  it("creates a normalized draft receipt", async () => {
    await service.create(workspaceId, {
      number: " pr-001 ",
      purchaseOrderId: orderId,
      warehouseId,
      supplierReference: "SUP-10",
    });

    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      number: "PR-001",
      purchaseOrderId: orderId,
      warehouseId,
      supplierReference: "SUP-10",
    });
  });

  it("maps an unavailable purchase order to a bad request", async () => {
    repository.create.mockRejectedValueOnce(
      new PurchaseReceiptOrderUnavailableError(),
    );

    await expect(
      service.create(workspaceId, {
        number: "PR-001",
        purchaseOrderId: orderId,
        warehouseId,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("adds a positive Decimal quantity", async () => {
    await service.addLine(workspaceId, receiptId, {
      purchaseOrderLineId: orderLineId,
      inventoryItemId,
      quantity: 2.5,
    });

    expect(repository.addLine).toHaveBeenCalledWith({
      workspaceId,
      purchaseReceiptId: receiptId,
      purchaseOrderLineId: orderLineId,
      inventoryItemId,
      quantity: new Prisma.Decimal(2.5),
    });
  });

  it("rejects a zero quantity outside DTO validation", async () => {
    await expect(
      service.addLine(workspaceId, receiptId, {
        purchaseOrderLineId: orderLineId,
        inventoryItemId,
        quantity: 0,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.addLine).not.toHaveBeenCalled();
  });

  it("maps over-receipt to a bad request", async () => {
    repository.addLine.mockRejectedValueOnce(
      new PurchaseReceiptOverQuantityError(),
    );

    await expect(
      service.addLine(workspaceId, receiptId, {
        purchaseOrderLineId: orderLineId,
        inventoryItemId,
        quantity: 20,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("keeps received receipts immutable", async () => {
    repository.findById.mockResolvedValueOnce(
      receipt(PurchaseReceiptStatus.RECEIVED, [line()]),
    );

    await expect(
      service.update(workspaceId, receiptId, { notes: "Changed" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("refuses to confirm an empty receipt", async () => {
    await expect(service.confirm(workspaceId, receiptId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.confirm).not.toHaveBeenCalled();
  });

  it("confirms a draft receipt with lines", async () => {
    repository.findById.mockResolvedValueOnce(receipt(undefined, [line()]));

    const result = await service.confirm(workspaceId, receiptId);

    expect(result.status).toBe(PurchaseReceiptStatus.RECEIVED);
    expect(repository.confirm).toHaveBeenCalledWith(workspaceId, receiptId);
  });

  it("prevents cancellation after confirmation", async () => {
    repository.findById.mockResolvedValueOnce(
      receipt(PurchaseReceiptStatus.RECEIVED, [line()]),
    );

    await expect(service.cancel(workspaceId, receiptId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.cancel).not.toHaveBeenCalled();
  });

  it("preserves workspace isolation when loading a receipt", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.get(workspaceId, receiptId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  function line() {
    return {
      id: "70000000-0000-4000-8000-000000000001",
      workspaceId,
      purchaseReceiptId: receiptId,
      purchaseOrderLineId: orderLineId,
      inventoryItemId,
      quantity: new Prisma.Decimal(2.5),
      createdAt: new Date("2026-08-09T00:00:00.000Z"),
      updatedAt: new Date("2026-08-09T00:00:00.000Z"),
    };
  }

  function receipt(
    status: PurchaseReceiptStatus = PurchaseReceiptStatus.DRAFT,
    lines: ReturnType<typeof line>[] = [],
  ) {
    return {
      id: receiptId,
      workspaceId,
      number: "PR-001",
      purchaseOrderId: orderId,
      warehouseId,
      status,
      supplierReference: null,
      notes: null,
      receivedAt:
        status === PurchaseReceiptStatus.RECEIVED
          ? new Date("2026-08-09T01:00:00.000Z")
          : null,
      createdAt: new Date("2026-08-09T00:00:00.000Z"),
      updatedAt: new Date("2026-08-09T00:00:00.000Z"),
      lines,
    };
  }
});
