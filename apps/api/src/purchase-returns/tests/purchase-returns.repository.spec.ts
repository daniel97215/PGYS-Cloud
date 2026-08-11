import { Prisma, PurchaseReturnStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PurchaseReceiptsRepository } from "../../purchase-receipts/purchase-receipts.repository";
import {
  StockMovementsRepository,
  StockUpdateRejectedError,
} from "../../stock-movements/stock-movements.repository";
import {
  PurchaseReturnOverQuantityError,
  PurchaseReturnStateConflictError,
  PurchaseReturnStockRejectedError,
  PurchaseReturnsRepository,
} from "../purchase-returns.repository";

describe("PurchaseReturnsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const returnId = "20000000-0000-4000-8000-000000000001";
  const receiptId = "30000000-0000-4000-8000-000000000001";
  const receiptLineId = "40000000-0000-4000-8000-000000000001";
  const inventoryItemId = "50000000-0000-4000-8000-000000000001";

  it("creates a draft return only for a received receipt", async () => {
    const create = jest.fn().mockResolvedValue(purchaseReturn());
    const transaction = transactionMock({ purchaseReturn: { create } });
    const receiptsRepository = receiptRepository();
    const repository = createRepository(transaction, receiptsRepository);

    await repository.create({
      workspaceId,
      number: "PRET-001",
      purchaseReceiptId: receiptId,
    });

    expect(receiptsRepository.findReceivedInTransaction).toHaveBeenCalledWith(
      expect.any(Object),
      workspaceId,
      receiptId,
    );
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        number: "PRET-001",
        purchaseReceiptId: receiptId,
      },
      include: { lines: { orderBy: expect.any(Array) } },
    });
    expectSerializable(transaction);
  });

  it("prevents a draft line from exceeding the received quantity", async () => {
    const create = jest.fn();
    const transaction = transactionMock({
      purchaseReturn: {
        findFirst: jest.fn().mockResolvedValue({ purchaseReceiptId: receiptId }),
      },
      purchaseReturnLine: {
        aggregate: jest
          .fn()
          .mockResolvedValueOnce({ _sum: { quantity: new Prisma.Decimal(8) } })
          .mockResolvedValueOnce({ _sum: { quantity: null } }),
        create,
      },
    });
    const repository = createRepository(transaction);

    await expect(
      repository.addLine({
        workspaceId,
        purchaseReturnId: returnId,
        purchaseReceiptLineId: receiptLineId,
        inventoryItemId,
        quantity: new Prisma.Decimal(3),
      }),
    ).rejects.toBeInstanceOf(PurchaseReturnOverQuantityError);
    expect(create).not.toHaveBeenCalled();
  });

  it("confirms a partial return and creates an outbound movement atomically", async () => {
    const { repository, transaction, stockRepository } =
      confirmationRepository(4, 2, 10);

    const result = await repository.confirm(workspaceId, returnId);

    expect(result.status).toBe(PurchaseReturnStatus.RETURNED);
    expect(
      stockRepository.createOutboundMovementInTransaction,
    ).toHaveBeenCalledWith(expect.any(Object), {
      workspaceId,
      inventoryItemId,
      quantity: new Prisma.Decimal(4),
      referenceType: "PURCHASE_RETURN",
      referenceId: returnId,
      occurredAt: expect.any(Date),
      reason: "Damaged",
    });
    expectSerializable(transaction);
  });

  it("revalidates cumulative returns before changing stock", async () => {
    const { repository, stockRepository } = confirmationRepository(4, 7, 10);

    await expect(
      repository.confirm(workspaceId, returnId),
    ).rejects.toBeInstanceOf(PurchaseReturnOverQuantityError);
    expect(
      stockRepository.createOutboundMovementInTransaction,
    ).not.toHaveBeenCalled();
  });

  it("rejects insufficient available stock without a partial return", async () => {
    const stockRepository = {
      createOutboundMovementInTransaction: jest
        .fn()
        .mockRejectedValue(new StockUpdateRejectedError()),
    } as unknown as jest.Mocked<StockMovementsRepository>;
    const { repository } = confirmationRepository(4, 0, 10, stockRepository);

    await expect(
      repository.confirm(workspaceId, returnId),
    ).rejects.toBeInstanceOf(PurchaseReturnStockRejectedError);
  });

  it("rejects a repeated confirmation before stock mutation", async () => {
    const transaction = transactionMock({
      purchaseReturn: { updateManyAndReturn: jest.fn().mockResolvedValue([]) },
    });
    const stockRepository = stockMovementRepository();
    const repository = createRepository(
      transaction,
      receiptRepository(),
      stockRepository,
    );

    await expect(
      repository.confirm(workspaceId, returnId),
    ).rejects.toBeInstanceOf(PurchaseReturnStateConflictError);
    expect(
      stockRepository.createOutboundMovementInTransaction,
    ).not.toHaveBeenCalled();
  });

  function confirmationRepository(
    quantity: number,
    previouslyReturned: number,
    receivedQuantity: number,
    stockRepository = stockMovementRepository(),
  ) {
    const transaction = transactionMock({
      purchaseReturn: {
        updateManyAndReturn: jest.fn().mockResolvedValue([
          {
            id: returnId,
            purchaseReceiptId: receiptId,
            reason: "Damaged",
          },
        ]),
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue(
            purchaseReturn(PurchaseReturnStatus.RETURNED, [line(quantity)]),
          ),
      },
      purchaseReturnLine: {
        findMany: jest.fn().mockResolvedValue([line(quantity)]),
        aggregate: jest.fn().mockResolvedValue({
          _sum: { quantity: new Prisma.Decimal(previouslyReturned) },
        }),
      },
    });
    const receiptsRepository = receiptRepository({
      findReceivedLineInTransaction: jest.fn().mockResolvedValue({
        ...line(receivedQuantity),
        quantity: new Prisma.Decimal(receivedQuantity),
      }),
    });

    return {
      repository: createRepository(
        transaction,
        receiptsRepository,
        stockRepository,
      ),
      transaction,
      stockRepository,
    };
  }

  function createRepository(
    transaction: jest.Mock,
    receiptsRepository = receiptRepository(),
    stockRepository = stockMovementRepository(),
  ) {
    return new PurchaseReturnsRepository(
      { $transaction: transaction } as unknown as PrismaService,
      receiptsRepository,
      stockRepository,
    );
  }

  function receiptRepository(overrides: object = {}) {
    return {
      findReceivedInTransaction: jest.fn().mockResolvedValue({ id: receiptId }),
      findReceivedLineInTransaction: jest.fn().mockResolvedValue({
        ...line(10),
        quantity: new Prisma.Decimal(10),
      }),
      ...overrides,
    } as unknown as jest.Mocked<PurchaseReceiptsRepository>;
  }

  function stockMovementRepository() {
    return {
      createOutboundMovementInTransaction: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<StockMovementsRepository>;
  }

  function transactionMock(client: object) {
    return jest.fn(async (callback: (transaction: object) => unknown) =>
      callback(client),
    );
  }

  function expectSerializable(transaction: jest.Mock) {
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  function line(quantity = 4) {
    return {
      id: "60000000-0000-4000-8000-000000000001",
      workspaceId,
      purchaseReturnId: returnId,
      purchaseReceiptLineId: receiptLineId,
      inventoryItemId,
      quantity: new Prisma.Decimal(quantity),
      reason: null,
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
      reason: "Damaged",
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
