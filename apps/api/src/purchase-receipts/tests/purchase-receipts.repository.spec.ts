import {
  Prisma,
  PurchaseOrderStatus,
  PurchaseReceiptStatus,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PurchaseOrdersRepository } from "../../purchase-orders/purchase-orders.repository";
import { StockMovementsRepository } from "../../stock-movements/stock-movements.repository";
import {
  PurchaseReceiptOverQuantityError,
  PurchaseReceiptStateConflictError,
  PurchaseReceiptsRepository,
} from "../purchase-receipts.repository";

describe("PurchaseReceiptsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const receiptId = "20000000-0000-4000-8000-000000000001";
  const orderId = "30000000-0000-4000-8000-000000000001";
  const orderLineId = "40000000-0000-4000-8000-000000000001";
  const inventoryItemId = "50000000-0000-4000-8000-000000000001";
  const warehouseId = "60000000-0000-4000-8000-000000000001";
  const productId = "70000000-0000-4000-8000-000000000001";

  it("creates a draft receipt only for an available order and warehouse", async () => {
    const create = jest.fn().mockResolvedValue(receipt());
    const transaction = transactionMock({
      purchaseOrder: { findFirst: jest.fn().mockResolvedValue({ id: orderId }) },
      purchaseReceipt: { create },
    });
    const repository = createRepository(transaction);

    await repository.create({
      workspaceId,
      number: "PR-001",
      purchaseOrderId: orderId,
      warehouseId,
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        number: "PR-001",
        purchaseOrderId: orderId,
        warehouseId,
      },
      include: { lines: { orderBy: expect.any(Array) } },
    });
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it("prevents an added line from exceeding previous receipts", async () => {
    const create = jest.fn();
    const transaction = transactionMock({
      purchaseReceipt: {
        findFirst: jest.fn().mockResolvedValue(receiptContext()),
      },
      purchaseOrder: { findFirst: jest.fn().mockResolvedValue({ id: orderId }) },
      purchaseOrderLine: {
        findFirst: jest.fn().mockResolvedValue(orderLine(10)),
      },
      inventoryItem: {
        findFirst: jest.fn().mockResolvedValue(inventoryItem()),
      },
      purchaseReceiptLine: {
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
        purchaseReceiptId: receiptId,
        purchaseOrderLineId: orderLineId,
        inventoryItemId,
        quantity: new Prisma.Decimal(3),
      }),
    ).rejects.toBeInstanceOf(PurchaseReceiptOverQuantityError);
    expect(create).not.toHaveBeenCalled();
  });

  it("confirms a partial receipt and creates its inbound movement atomically", async () => {
    const { repository, transaction, stockRepository, orderRepository } =
      confirmationRepository(4, 4);

    const result = await repository.confirm(workspaceId, receiptId);

    expect(result.status).toBe(PurchaseReceiptStatus.RECEIVED);
    expect(
      stockRepository.createInboundMovementInTransaction,
    ).toHaveBeenCalledWith(expect.any(Object), {
      workspaceId,
      inventoryItemId,
      quantity: new Prisma.Decimal(4),
      referenceType: "PURCHASE_RECEIPT",
      referenceId: receiptId,
      occurredAt: expect.any(Date),
    });
    expect(
      orderRepository.updateReceivingStatusInTransaction,
    ).toHaveBeenCalledWith(
      expect.any(Object),
      workspaceId,
      orderId,
      PurchaseOrderStatus.PARTIALLY_RECEIVED,
    );
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it("marks the purchase order received when all quantities are complete", async () => {
    const { repository, orderRepository } = confirmationRepository(10, 10);

    await repository.confirm(workspaceId, receiptId);

    expect(
      orderRepository.updateReceivingStatusInTransaction,
    ).toHaveBeenCalledWith(
      expect.any(Object),
      workspaceId,
      orderId,
      PurchaseOrderStatus.RECEIVED,
    );
  });

  it("revalidates over-receipt before changing stock", async () => {
    const { repository, stockRepository } = confirmationRepository(4, 12, 8);

    await expect(
      repository.confirm(workspaceId, receiptId),
    ).rejects.toBeInstanceOf(PurchaseReceiptOverQuantityError);
    expect(
      stockRepository.createInboundMovementInTransaction,
    ).not.toHaveBeenCalled();
  });

  it("rejects a second confirmation before any stock mutation", async () => {
    const transaction = transactionMock({
      purchaseReceipt: { updateManyAndReturn: jest.fn().mockResolvedValue([]) },
    });
    const repository = createRepository(transaction);

    await expect(
      repository.confirm(workspaceId, receiptId),
    ).rejects.toBeInstanceOf(PurchaseReceiptStateConflictError);
  });

  function confirmationRepository(
    lineQuantity: number,
    receivedTotal: number,
    previousReceived = 0,
  ) {
    const transactionClient = {
      purchaseReceipt: {
        updateManyAndReturn: jest.fn().mockResolvedValue([receiptContext()]),
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue(receipt(PurchaseReceiptStatus.RECEIVED)),
      },
      purchaseOrder: {
        findFirst: jest.fn().mockResolvedValue({ id: orderId }),
      },
      purchaseReceiptLine: {
        findMany: jest.fn().mockResolvedValue([receiptLine(lineQuantity)]),
        aggregate: jest
          .fn()
          .mockResolvedValueOnce({
            _sum: { quantity: new Prisma.Decimal(previousReceived) },
          })
          .mockResolvedValueOnce({
            _sum: { quantity: new Prisma.Decimal(receivedTotal) },
          }),
      },
      purchaseOrderLine: {
        findFirst: jest.fn().mockResolvedValue(orderLine(10)),
        findMany: jest.fn().mockResolvedValue([
          { id: orderLineId, quantity: new Prisma.Decimal(10) },
        ]),
      },
      inventoryItem: {
        findFirst: jest.fn().mockResolvedValue(inventoryItem()),
      },
    };
    const transaction = transactionMock(transactionClient);
    const stockRepository = {
      createInboundMovementInTransaction: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<StockMovementsRepository>;
    const orderRepository = {
      updateReceivingStatusInTransaction: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<PurchaseOrdersRepository>;
    const repository = new PurchaseReceiptsRepository(
      createPrismaMock(transaction),
      orderRepository,
      stockRepository,
    );

    return { repository, transaction, stockRepository, orderRepository };
  }

  function createRepository(transaction: jest.Mock) {
    return new PurchaseReceiptsRepository(
      createPrismaMock(transaction),
      {
        updateReceivingStatusInTransaction: jest.fn().mockResolvedValue(true),
      } as unknown as PurchaseOrdersRepository,
      {
        createInboundMovementInTransaction: jest.fn().mockResolvedValue({}),
      } as unknown as StockMovementsRepository,
    );
  }

  function receiptContext() {
    return { id: receiptId, purchaseOrderId: orderId, warehouseId };
  }

  function orderLine(quantity: number) {
    return {
      productId,
      productVariantId: null,
      quantity: new Prisma.Decimal(quantity),
    };
  }

  function inventoryItem() {
    return { productId, productVariantId: null };
  }

  function receiptLine(quantity: number) {
    return {
      id: "80000000-0000-4000-8000-000000000001",
      workspaceId,
      purchaseReceiptId: receiptId,
      purchaseOrderLineId: orderLineId,
      inventoryItemId,
      quantity: new Prisma.Decimal(quantity),
      createdAt: new Date("2026-08-09T00:00:00.000Z"),
      updatedAt: new Date("2026-08-09T00:00:00.000Z"),
    };
  }

  function receipt(
    status: PurchaseReceiptStatus = PurchaseReceiptStatus.DRAFT,
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
      lines: [],
    };
  }
});

function transactionMock(client: Record<string, unknown>): jest.Mock {
  return jest.fn(async (callback: (value: unknown) => unknown) =>
    callback(client),
  );
}

function createPrismaMock(transaction: jest.Mock): PrismaService {
  return { $transaction: transaction } as unknown as PrismaService;
}
