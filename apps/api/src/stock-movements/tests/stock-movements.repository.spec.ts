import { Prisma, StockMovementDirection } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  StockMovementsRepository,
  StockUpdateRejectedError,
} from "../stock-movements.repository";

describe("StockMovementsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const inventoryItemId = "20000000-0000-4000-8000-000000000001";
  const movementId = "30000000-0000-4000-8000-000000000001";

  it("atomically creates an IN movement and increments stock", async () => {
    const updateManyAndReturn = jest
      .fn()
      .mockResolvedValue([{ quantityOnHand: new Prisma.Decimal(15) }]);
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
      select: { quantityOnHand: true },
    });
    const createData = create.mock.calls[0][0].data;
    expect(createData.quantityBefore.toString()).toBe("10");
    expect(createData.quantityAfter.toString()).toBe("15");
  });

  it("atomically creates an OUT movement with a non-negative guard", async () => {
    const updateManyAndReturn = jest
      .fn()
      .mockResolvedValue([{ quantityOnHand: new Prisma.Decimal(7) }]);
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
      select: { quantityOnHand: true },
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
