import {
  InventoryCountStatus,
  Prisma,
  StockMovementDirection,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  IncompleteInventoryCountError,
  InventoryCountsRepository,
} from "../inventory-counts.repository";

describe("InventoryCountsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const warehouseId = "20000000-0000-4000-8000-000000000001";
  const storageLocationId = "30000000-0000-4000-8000-000000000001";
  const inventoryCountId = "40000000-0000-4000-8000-000000000001";
  const inventoryItemId = "50000000-0000-4000-8000-000000000001";

  it("creates snapshot lines from active location inventory items", async () => {
    const findMany = jest.fn().mockResolvedValue([
      { id: inventoryItemId, quantityOnHand: new Prisma.Decimal(5) },
      {
        id: "50000000-0000-4000-8000-000000000002",
        quantityOnHand: new Prisma.Decimal(2),
      },
    ]);
    const count = createCount(InventoryCountStatus.DRAFT, []);
    const create = jest.fn().mockResolvedValue(count);
    const transaction = jest.fn(async (callback: (value: unknown) => unknown) =>
      callback({
        inventoryItem: { findMany },
        inventoryCount: { create },
      }),
    );
    const prisma = createPrismaMock({ transaction });
    const repository = new InventoryCountsRepository(prisma);

    const result = await repository.createWithLines({
      workspaceId,
      warehouseId,
      storageLocationId,
      code: "COUNT-001",
    });

    expect(result).toEqual(count);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        workspaceId,
        warehouseId,
        storageLocationId,
        isActive: true,
      },
      select: { id: true, quantityOnHand: true },
      orderBy: { id: "asc" },
    });
    const lineData = create.mock.calls[0][0].data.lines.create;
    expect(lineData).toHaveLength(2);
    expect(lineData[0].expectedQuantity.toString()).toBe("5");
    expect(transaction).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  });

  it("updates a count line with workspace isolation", async () => {
    const update = jest.fn().mockResolvedValue({ id: "line-1" });
    const repository = new InventoryCountsRepository(
      createPrismaMock({ lineUpdate: update }),
    );

    await repository.updateLine(
      workspaceId,
      inventoryCountId,
      "60000000-0000-4000-8000-000000000001",
      new Prisma.Decimal(7),
      new Prisma.Decimal(2),
    );

    expect(update).toHaveBeenCalledWith({
      where: {
        id: "60000000-0000-4000-8000-000000000001",
        workspaceId,
        inventoryCountId,
      },
      data: {
        countedQuantity: new Prisma.Decimal(7),
        variance: new Prisma.Decimal(2),
      },
    });
  });

  it("transitions status conditionally", async () => {
    const updateManyAndReturn = jest
      .fn()
      .mockResolvedValue([createCount(InventoryCountStatus.IN_PROGRESS, [])]);
    const repository = new InventoryCountsRepository(
      createPrismaMock({ countUpdateManyAndReturn: updateManyAndReturn }),
    );

    await repository.transitionStatus(
      workspaceId,
      inventoryCountId,
      InventoryCountStatus.DRAFT,
      InventoryCountStatus.IN_PROGRESS,
    );

    expect(updateManyAndReturn).toHaveBeenCalledWith({
      where: {
        id: inventoryCountId,
        workspaceId,
        status: InventoryCountStatus.DRAFT,
      },
      data: { status: InventoryCountStatus.IN_PROGRESS },
    });
  });

  it("completes atomically and creates movements only for non-zero variances", async () => {
    const lines = [
      createLine("50000000-0000-4000-8000-000000000001", 5, 7),
      createLine("50000000-0000-4000-8000-000000000002", 5, 3),
      createLine("50000000-0000-4000-8000-000000000003", 5, 5),
    ];
    const claim = jest.fn().mockResolvedValue([{ id: inventoryCountId }]);
    const findLines = jest.fn().mockResolvedValue(lines);
    const updateItems = jest
      .fn()
      .mockResolvedValueOnce([{ id: lines[0].inventoryItemId }])
      .mockResolvedValueOnce([{ id: lines[1].inventoryItemId }]);
    const createMovement = jest.fn().mockResolvedValue({});
    const completed = createCount(InventoryCountStatus.COMPLETED, lines);
    const findUniqueOrThrow = jest.fn().mockResolvedValue(completed);
    const transaction = jest.fn(async (callback: (value: unknown) => unknown) =>
      callback({
        inventoryCount: {
          updateManyAndReturn: claim,
          findUniqueOrThrow,
        },
        inventoryCountLine: { findMany: findLines },
        inventoryItem: { updateManyAndReturn: updateItems },
        stockMovement: { create: createMovement },
      }),
    );
    const repository = new InventoryCountsRepository(
      createPrismaMock({ transaction }),
    );

    const result = await repository.complete(workspaceId, inventoryCountId);

    expect(result).toEqual(completed);
    expect(claim).toHaveBeenCalledWith({
      where: {
        id: inventoryCountId,
        workspaceId,
        status: InventoryCountStatus.IN_PROGRESS,
      },
      data: {
        status: InventoryCountStatus.COMPLETED,
        completedAt: expect.any(Date),
      },
      select: { id: true },
    });
    expect(updateItems).toHaveBeenCalledTimes(2);
    expect(createMovement).toHaveBeenCalledTimes(2);
    const inbound = createMovement.mock.calls[0][0].data;
    const outbound = createMovement.mock.calls[1][0].data;
    expect(inbound.direction).toBe(StockMovementDirection.IN);
    expect(inbound.quantity.toString()).toBe("2");
    expect(outbound.direction).toBe(StockMovementDirection.OUT);
    expect(outbound.quantity.toString()).toBe("2");
    expect(inbound.referenceType).toBe("INVENTORY_COUNT");
    expect(outbound.referenceId).toBe(inventoryCountId);
  });

  it("rejects an incomplete count before changing stock or creating movements", async () => {
    const claim = jest.fn().mockResolvedValue([{ id: inventoryCountId }]);
    const findLines = jest
      .fn()
      .mockResolvedValue([createLine(inventoryItemId, 5, null)]);
    const updateItems = jest.fn();
    const createMovement = jest.fn();
    const transaction = jest.fn(async (callback: (value: unknown) => unknown) =>
      callback({
        inventoryCount: { updateManyAndReturn: claim },
        inventoryCountLine: { findMany: findLines },
        inventoryItem: { updateManyAndReturn: updateItems },
        stockMovement: { create: createMovement },
      }),
    );
    const repository = new InventoryCountsRepository(
      createPrismaMock({ transaction }),
    );

    await expect(
      repository.complete(workspaceId, inventoryCountId),
    ).rejects.toBeInstanceOf(IncompleteInventoryCountError);
    expect(updateItems).not.toHaveBeenCalled();
    expect(createMovement).not.toHaveBeenCalled();
  });

  function createCount(
    status: InventoryCountStatus,
    lines: ReturnType<typeof createLine>[],
  ) {
    return {
      id: inventoryCountId,
      workspaceId,
      warehouseId,
      storageLocationId,
      code: "COUNT-001",
      status,
      description: null,
      completedAt:
        status === InventoryCountStatus.COMPLETED
          ? new Date("2026-01-02T00:00:00.000Z")
          : null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      lines,
    };
  }

  function createLine(
    itemId: string,
    expected: number,
    counted: number | null,
  ) {
    return {
      id: `line-${itemId}`,
      workspaceId,
      inventoryCountId,
      inventoryItemId: itemId,
      expectedQuantity: new Prisma.Decimal(expected),
      countedQuantity:
        counted === null ? null : new Prisma.Decimal(counted),
      variance:
        counted === null ? null : new Prisma.Decimal(counted - expected),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
  }
});

function createPrismaMock(methods: {
  transaction?: jest.Mock;
  lineUpdate?: jest.Mock;
  countUpdateManyAndReturn?: jest.Mock;
}): PrismaService {
  return {
    $transaction: methods.transaction ?? jest.fn(),
    inventoryCount: {
      updateManyAndReturn: methods.countUpdateManyAndReturn ?? jest.fn(),
    },
    inventoryCountLine: { update: methods.lineUpdate ?? jest.fn() },
  } as unknown as PrismaService;
}
