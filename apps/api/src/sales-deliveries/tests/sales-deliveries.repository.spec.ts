import {
  Prisma,
  SalesDeliveryStatus,
  SalesOrderStatus,
  StockMovementDirection,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  SalesDeliveryOverQuantityError,
  SalesDeliveryStockRejectedError,
  SalesDeliveriesRepository,
} from "../sales-deliveries.repository";

describe("SalesDeliveriesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const deliveryId = "20000000-0000-4000-8000-000000000001";
  const orderId = "30000000-0000-4000-8000-000000000001";
  const orderLineId = "40000000-0000-4000-8000-000000000001";
  const inventoryItemId = "50000000-0000-4000-8000-000000000001";
  const productId = "60000000-0000-4000-8000-000000000001";

  it("creates a delivery only for a confirmed or processing order", async () => {
    const findOrder = jest.fn().mockResolvedValue({ id: orderId });
    const createDeliveryRecord = jest.fn().mockResolvedValue(createDelivery());
    const transaction = transactionMock({
      salesOrder: { findFirst: findOrder },
      salesDelivery: { create: createDeliveryRecord },
    });
    const repository = new SalesDeliveriesRepository(
      createPrismaMock(transaction),
    );

    await repository.create({
      workspaceId,
      number: "DEL-001",
      salesOrderId: orderId,
    });

    expect(findOrder).toHaveBeenCalledWith({
      where: {
        id: orderId,
        workspaceId,
        status: {
          in: [SalesOrderStatus.CONFIRMED, SalesOrderStatus.PROCESSING],
        },
      },
      select: { id: true },
    });
    expect(createDeliveryRecord).toHaveBeenCalled();
  });

  it("supports partial deliveries while enforcing the ordered quantity", async () => {
    const createLine = jest.fn();
    const transaction = addLineTransaction({
      deliveredQuantity: 4,
      createLine,
    });
    const repository = new SalesDeliveriesRepository(
      createPrismaMock(transaction),
    );

    await repository.addLine({
      workspaceId,
      salesDeliveryId: deliveryId,
      salesOrderLineId: orderLineId,
      inventoryItemId,
      quantity: new Prisma.Decimal(3),
    });

    expect(createLine).toHaveBeenCalledWith({
      data: {
        workspaceId,
        salesDeliveryId: deliveryId,
        salesOrderLineId: orderLineId,
        inventoryItemId,
        quantity: new Prisma.Decimal(3),
      },
    });
  });

  it("rejects cumulative quantities above the ordered quantity", async () => {
    const createLine = jest.fn();
    const repository = new SalesDeliveriesRepository(
      createPrismaMock(
        addLineTransaction({ deliveredQuantity: 8, createLine }),
      ),
    );

    await expect(
      repository.addLine({
        workspaceId,
        salesDeliveryId: deliveryId,
        salesOrderLineId: orderLineId,
        inventoryItemId,
        quantity: new Prisma.Decimal(3),
      }),
    ).rejects.toBeInstanceOf(SalesDeliveryOverQuantityError);
    expect(createLine).not.toHaveBeenCalled();
  });

  it("moves stock and creates a referenced movement atomically", async () => {
    const createMovement = jest.fn();
    const transaction = shipTransaction({
      inventoryResult: {
        quantityOnHand: new Prisma.Decimal(7),
        quantityReserved: new Prisma.Decimal(2),
      },
      createMovement,
    });
    const repository = new SalesDeliveriesRepository(
      createPrismaMock(transaction),
    );

    const result = await repository.ship(workspaceId, deliveryId);

    expect(result.status).toBe(SalesDeliveryStatus.SHIPPED);
    const movement = createMovement.mock.calls[0][0].data;
    expect(movement.direction).toBe(StockMovementDirection.OUT);
    expect(movement.quantity.toString()).toBe("3");
    expect(movement.quantityBefore.toString()).toBe("10");
    expect(movement.quantityAfter.toString()).toBe("7");
    expect(movement.referenceType).toBe("SALES_DELIVERY");
    expect(movement.referenceId).toBe(deliveryId);
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it("rolls back shipment when it would consume reserved stock", async () => {
    const createMovement = jest.fn();
    const repository = new SalesDeliveriesRepository(
      createPrismaMock(
        shipTransaction({
          inventoryResult: {
            quantityOnHand: new Prisma.Decimal(7),
            quantityReserved: new Prisma.Decimal(8),
          },
          createMovement,
        }),
      ),
    );

    await expect(
      repository.ship(workspaceId, deliveryId),
    ).rejects.toBeInstanceOf(SalesDeliveryStockRejectedError);
    expect(createMovement).not.toHaveBeenCalled();
  });

  it("requires at least one line when transitioning to ready", async () => {
    const transition = jest.fn().mockResolvedValue([
      { id: deliveryId },
    ]);
    const transaction = transactionMock({
      salesDelivery: {
        updateManyAndReturn: transition,
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue(createDelivery(SalesDeliveryStatus.READY)),
      },
    });
    const repository = new SalesDeliveriesRepository(
      createPrismaMock(transaction),
    );

    await repository.ready(workspaceId, deliveryId);

    expect(transition).toHaveBeenCalledWith({
      where: {
        id: deliveryId,
        workspaceId,
        status: { in: [SalesDeliveryStatus.DRAFT] },
        lines: { some: {} },
      },
      data: { status: SalesDeliveryStatus.READY },
      select: { id: true },
    });
  });

  function addLineTransaction(options: {
    deliveredQuantity: number;
    createLine: jest.Mock;
  }) {
    return transactionMock({
      salesDelivery: {
        findFirst: jest.fn().mockResolvedValue({
          id: deliveryId,
          salesOrderId: orderId,
        }),
        findUniqueOrThrow: jest.fn().mockResolvedValue(createDelivery()),
      },
      salesOrderLine: {
        findFirst: jest.fn().mockResolvedValue({
          id: orderLineId,
          workspaceId,
          salesOrderId: orderId,
          productId,
          productVariantId: null,
          quantity: new Prisma.Decimal(10),
        }),
      },
      inventoryItem: {
        findFirst: jest.fn().mockResolvedValue({
          productId,
          productVariantId: null,
        }),
      },
      salesDeliveryLine: {
        aggregate: jest.fn().mockResolvedValue({
          _sum: { quantity: new Prisma.Decimal(options.deliveredQuantity) },
        }),
        create: options.createLine,
      },
    });
  }

  function shipTransaction(options: {
    inventoryResult: {
      quantityOnHand: Prisma.Decimal;
      quantityReserved: Prisma.Decimal;
    };
    createMovement: jest.Mock;
  }) {
    return transactionMock({
      salesDelivery: {
        updateManyAndReturn: jest.fn().mockResolvedValue([
          { id: deliveryId, salesOrderId: orderId },
        ]),
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue(createDelivery(SalesDeliveryStatus.SHIPPED)),
      },
      salesOrder: {
        updateManyAndReturn: jest.fn().mockResolvedValue([{ id: orderId }]),
      },
      salesDeliveryLine: {
        findMany: jest.fn().mockResolvedValue([createLine()]),
      },
      inventoryItem: {
        updateManyAndReturn: jest
          .fn()
          .mockResolvedValue([options.inventoryResult]),
      },
      stockMovement: { create: options.createMovement },
    });
  }

  function createDelivery(
    status: SalesDeliveryStatus = SalesDeliveryStatus.DRAFT,
    lines: ReturnType<typeof createLine>[] = [],
  ) {
    return {
      id: deliveryId,
      workspaceId,
      number: "DEL-001",
      salesOrderId: orderId,
      status,
      deliveryAddress: null,
      notes: null,
      shippedAt:
        status === SalesDeliveryStatus.SHIPPED
          ? new Date("2026-08-05T01:00:00.000Z")
          : null,
      deliveredAt: null,
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
      updatedAt: new Date("2026-08-05T00:00:00.000Z"),
      lines,
    };
  }

  function createLine() {
    return {
      id: "70000000-0000-4000-8000-000000000001",
      workspaceId,
      salesDeliveryId: deliveryId,
      salesOrderLineId: orderLineId,
      inventoryItemId,
      quantity: new Prisma.Decimal(3),
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
      updatedAt: new Date("2026-08-05T00:00:00.000Z"),
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
