import { Prisma, StockMovementDirection } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  StockMovementsRepository,
  StockTransferRejectedError,
  StockUpdateRejectedError,
} from "../stock-movements.repository";

describe("StockMovementsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const inventoryItemId = "20000000-0000-4000-8000-000000000001";
  const movementId = "30000000-0000-4000-8000-000000000001";

  it("atomically creates an IN movement and increments stock", async () => {
    const updateManyAndReturn = jest
      .fn()
      .mockResolvedValue([{
        quantityOnHand: new Prisma.Decimal(15),
        quantityReserved: new Prisma.Decimal(0),
      }]);
    const movement = createMovement({
      direction: StockMovementDirection.IN,
      quantity: 5,
      quantityBefore: 10,
      quantityAfter: 15,
    });
    const create = jest.fn().mockResolvedValue(movement);
    const transaction = createTransactionMock({ updateManyAndReturn, create });
    const prisma = createPrismaMock({ transaction });
    const repository = new StockMovementsRepository(prisma);

    const result = await repository.createMovementAndUpdateStock({
      workspaceId,
      inventoryItemId,
      direction: StockMovementDirection.IN,
      quantity: new Prisma.Decimal(5),
      reason: "Goods receipt",
    });

    expect(result).toEqual(movement);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(updateManyAndReturn).toHaveBeenCalledWith({
      where: { id: inventoryItemId, workspaceId, isActive: true },
      data: { quantityOnHand: { increment: new Prisma.Decimal(5) } },
      select: { quantityOnHand: true, quantityReserved: true },
    });
    const createData = create.mock.calls[0][0].data;
    expect(createData.quantityBefore.toString()).toBe("10");
    expect(createData.quantityAfter.toString()).toBe("15");
  });

  it("atomically creates an OUT movement with a non-negative guard", async () => {
    const updateManyAndReturn = jest
      .fn()
      .mockResolvedValue([{
        quantityOnHand: new Prisma.Decimal(7),
        quantityReserved: new Prisma.Decimal(0),
      }]);
    const movement = createMovement({
      direction: StockMovementDirection.OUT,
      quantity: 3,
      quantityBefore: 10,
      quantityAfter: 7,
    });
    const create = jest.fn().mockResolvedValue(movement);
    const repository = new StockMovementsRepository(
      createPrismaMock({
        transaction: createTransactionMock({ updateManyAndReturn, create }),
      }),
    );

    await repository.createMovementAndUpdateStock({
      workspaceId,
      inventoryItemId,
      direction: StockMovementDirection.OUT,
      quantity: new Prisma.Decimal(3),
    });

    expect(updateManyAndReturn).toHaveBeenCalledWith({
      where: {
        id: inventoryItemId,
        workspaceId,
        isActive: true,
        quantityOnHand: { gte: new Prisma.Decimal(3) },
      },
      data: { quantityOnHand: { decrement: new Prisma.Decimal(3) } },
      select: { quantityOnHand: true, quantityReserved: true },
    });
    const createData = create.mock.calls[0][0].data;
    expect(createData.quantityBefore.toString()).toBe("10");
    expect(createData.quantityAfter.toString()).toBe("7");
  });

  it("does not create a movement when the guarded stock update fails", async () => {
    const updateManyAndReturn = jest.fn().mockResolvedValue([]);
    const create = jest.fn();
    const repository = new StockMovementsRepository(
      createPrismaMock({
        transaction: createTransactionMock({ updateManyAndReturn, create }),
      }),
    );

    await expect(
      repository.createMovementAndUpdateStock({
        workspaceId,
        inventoryItemId,
        direction: StockMovementDirection.OUT,
        quantity: new Prisma.Decimal(11),
      }),
    ).rejects.toBeInstanceOf(StockUpdateRejectedError);
    expect(create).not.toHaveBeenCalled();
  });

  it("rolls back an OUT movement that would consume reserved stock", async () => {
    const updateManyAndReturn = jest.fn().mockResolvedValue([{
      quantityOnHand: new Prisma.Decimal(6),
      quantityReserved: new Prisma.Decimal(7),
    }]);
    const create = jest.fn();
    const repository = new StockMovementsRepository(
      createPrismaMock({
        transaction: createTransactionMock({ updateManyAndReturn, create }),
      }),
    );

    await expect(
      repository.createMovementAndUpdateStock({
        workspaceId,
        inventoryItemId,
        direction: StockMovementDirection.OUT,
        quantity: new Prisma.Decimal(4),
      }),
    ).rejects.toBeInstanceOf(StockUpdateRejectedError);
    expect(create).not.toHaveBeenCalled();
  });

  it("atomically transfers stock with two linked movements", async () => {
    const destinationInventoryItemId =
      "20000000-0000-4000-8000-000000000002";
    const referenceId = "40000000-0000-4000-8000-000000000001";
    const updateManyAndReturn = jest
      .fn()
      .mockResolvedValueOnce([{
        quantityOnHand: new Prisma.Decimal(7),
        quantityReserved: new Prisma.Decimal(0),
      }])
      .mockResolvedValueOnce([{ quantityOnHand: new Prisma.Decimal(8) }]);
    const outMovement = createMovement({
      direction: StockMovementDirection.OUT,
      quantity: 3,
      quantityBefore: 10,
      quantityAfter: 7,
    });
    const inMovement = {
      ...createMovement({
        direction: StockMovementDirection.IN,
        quantity: 3,
        quantityBefore: 5,
        quantityAfter: 8,
      }),
      id: "30000000-0000-4000-8000-000000000002",
      inventoryItemId: destinationInventoryItemId,
    };
    const create = jest
      .fn()
      .mockResolvedValueOnce(outMovement)
      .mockResolvedValueOnce(inMovement);
    const prisma = createPrismaMock({
      transaction: createTransactionMock({ updateManyAndReturn, create }),
    });
    const repository = new StockMovementsRepository(prisma);

    const result = await repository.createTransferAndUpdateStock({
      workspaceId,
      sourceInventoryItemId: inventoryItemId,
      destinationInventoryItemId,
      quantity: new Prisma.Decimal(3),
      referenceId,
      reason: "Replenishment",
    });

    expect(result).toEqual({ outMovement, inMovement });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(updateManyAndReturn).toHaveBeenNthCalledWith(1, {
      where: {
        id: inventoryItemId,
        workspaceId,
        isActive: true,
        quantityOnHand: { gte: new Prisma.Decimal(3) },
      },
      data: { quantityOnHand: { decrement: new Prisma.Decimal(3) } },
      select: { quantityOnHand: true, quantityReserved: true },
    });
    expect(updateManyAndReturn).toHaveBeenNthCalledWith(2, {
      where: {
        id: destinationInventoryItemId,
        workspaceId,
        isActive: true,
      },
      data: { quantityOnHand: { increment: new Prisma.Decimal(3) } },
      select: { quantityOnHand: true },
    });
    const outData = create.mock.calls[0][0].data;
    const inData = create.mock.calls[1][0].data;
    expect(outData.direction).toBe(StockMovementDirection.OUT);
    expect(inData.direction).toBe(StockMovementDirection.IN);
    expect(outData.referenceType).toBe("STOCK_TRANSFER");
    expect(inData.referenceType).toBe("STOCK_TRANSFER");
    expect(outData.referenceId).toBe(referenceId);
    expect(inData.referenceId).toBe(referenceId);
    expect(outData.quantityBefore.toString()).toBe("10");
    expect(outData.quantityAfter.toString()).toBe("7");
    expect(inData.quantityBefore.toString()).toBe("5");
    expect(inData.quantityAfter.toString()).toBe("8");
    expect(outData.occurredAt).toBe(inData.occurredAt);
  });

  it("rejects the whole transaction when the destination update fails", async () => {
    const updateManyAndReturn = jest
      .fn()
      .mockResolvedValueOnce([{
        quantityOnHand: new Prisma.Decimal(7),
        quantityReserved: new Prisma.Decimal(0),
      }])
      .mockResolvedValueOnce([]);
    const create = jest.fn().mockResolvedValue(createMovement({}));
    const repository = new StockMovementsRepository(
      createPrismaMock({
        transaction: createTransactionMock({ updateManyAndReturn, create }),
      }),
    );

    await expect(
      repository.createTransferAndUpdateStock({
        workspaceId,
        sourceInventoryItemId: inventoryItemId,
        destinationInventoryItemId:
          "20000000-0000-4000-8000-000000000002",
        quantity: new Prisma.Decimal(3),
        referenceId: "40000000-0000-4000-8000-000000000001",
      }),
    ).rejects.toBeInstanceOf(StockTransferRejectedError);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("rolls back a transfer that would consume reserved source stock", async () => {
    const updateManyAndReturn = jest.fn().mockResolvedValueOnce([{
      quantityOnHand: new Prisma.Decimal(6),
      quantityReserved: new Prisma.Decimal(7),
    }]);
    const create = jest.fn();
    const repository = new StockMovementsRepository(
      createPrismaMock({
        transaction: createTransactionMock({ updateManyAndReturn, create }),
      }),
    );

    await expect(
      repository.createTransferAndUpdateStock({
        workspaceId,
        sourceInventoryItemId: inventoryItemId,
        destinationInventoryItemId:
          "20000000-0000-4000-8000-000000000002",
        quantity: new Prisma.Decimal(4),
        referenceId: "40000000-0000-4000-8000-000000000001",
      }),
    ).rejects.toBeInstanceOf(StockTransferRejectedError);
    expect(create).not.toHaveBeenCalled();
  });

  it("creates an inbound receipt movement inside an existing transaction", async () => {
    const updateManyAndReturn = jest.fn().mockResolvedValue([
      { quantityOnHand: new Prisma.Decimal(12) },
    ]);
    const movement = createMovement({
      direction: StockMovementDirection.IN,
      quantity: 2,
      quantityBefore: 10,
      quantityAfter: 12,
    });
    const create = jest.fn().mockResolvedValue(movement);
    const repository = new StockMovementsRepository(createPrismaMock({}));
    const occurredAt = new Date("2026-08-09T00:00:00.000Z");

    await repository.createInboundMovementInTransaction(
      {
        inventoryItem: { updateManyAndReturn },
        stockMovement: { create },
      } as unknown as Prisma.TransactionClient,
      {
        workspaceId,
        inventoryItemId,
        quantity: new Prisma.Decimal(2),
        referenceType: "PURCHASE_RECEIPT",
        referenceId: "40000000-0000-4000-8000-000000000001",
        occurredAt,
      },
    );

    const data = create.mock.calls[0][0].data;
    expect(data.direction).toBe(StockMovementDirection.IN);
    expect(data.quantityBefore.toString()).toBe("10");
    expect(data.quantityAfter.toString()).toBe("12");
    expect(data.referenceType).toBe("PURCHASE_RECEIPT");
    expect(data.occurredAt).toBe(occurredAt);
  });

  it("finds a movement by id and workspace", async () => {
    const movement = createMovement({});
    const findFirst = jest.fn().mockResolvedValue(movement);
    const repository = new StockMovementsRepository(
      createPrismaMock({ movementFindFirst: findFirst }),
    );

    await repository.findById(workspaceId, movementId);

    expect(findFirst).toHaveBeenCalledWith({
      where: { id: movementId, workspaceId },
    });
  });

  it("lists movements by inventory item and workspace", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const repository = new StockMovementsRepository(
      createPrismaMock({ movementFindMany: findMany }),
    );

    await repository.findByInventoryItem(workspaceId, inventoryItemId);

    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId, inventoryItemId },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    });
  });

  it("lists all workspace movements", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const repository = new StockMovementsRepository(
      createPrismaMock({ movementFindMany: findMany }),
    );

    await repository.findByWorkspace(workspaceId);

    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    });
  });

  function createMovement(overrides: {
    direction?: StockMovementDirection;
    quantity?: number;
    quantityBefore?: number;
    quantityAfter?: number;
  }) {
    return {
      id: movementId,
      workspaceId,
      inventoryItemId,
      direction: overrides.direction ?? StockMovementDirection.IN,
      quantity: new Prisma.Decimal(overrides.quantity ?? 5),
      quantityBefore: new Prisma.Decimal(overrides.quantityBefore ?? 10),
      quantityAfter: new Prisma.Decimal(overrides.quantityAfter ?? 15),
      reason: null,
      referenceType: null,
      referenceId: null,
      occurredAt: new Date("2026-01-01T00:00:00.000Z"),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    };
  }
});

function createTransactionMock(methods: {
  updateManyAndReturn: jest.Mock;
  create: jest.Mock;
}) {
  return jest.fn(async (callback: (transaction: unknown) => unknown) =>
    callback({
      inventoryItem: { updateManyAndReturn: methods.updateManyAndReturn },
      stockMovement: { create: methods.create },
    }),
  );
}

function createPrismaMock(methods: {
  transaction?: jest.Mock;
  movementFindFirst?: jest.Mock;
  movementFindMany?: jest.Mock;
  inventoryItemFindFirst?: jest.Mock;
}): PrismaService {
  return {
    $transaction: methods.transaction ?? jest.fn(),
    stockMovement: {
      findFirst: methods.movementFindFirst ?? jest.fn(),
      findMany: methods.movementFindMany ?? jest.fn(),
    },
    inventoryItem: {
      findFirst: methods.inventoryItemFindFirst ?? jest.fn(),
    },
  } as unknown as PrismaService;
}
