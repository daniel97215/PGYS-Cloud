import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InventoryCountStatus, Prisma } from "@prisma/client";
import {
  InventoryCountLineRecord,
  InventoryCountsRepository,
} from "../inventory-counts.repository";
import { InventoryCountsService } from "../inventory-counts.service";

describe("InventoryCountsService", () => {
  let repository: jest.Mocked<InventoryCountsRepository>;
  let service: InventoryCountsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const warehouseId = "20000000-0000-4000-8000-000000000001";
  const storageLocationId = "30000000-0000-4000-8000-000000000001";
  const inventoryCountId = "40000000-0000-4000-8000-000000000001";
  const lineId = "50000000-0000-4000-8000-000000000001";
  const line = {
    id: lineId,
    workspaceId,
    inventoryCountId,
    inventoryItemId: "60000000-0000-4000-8000-000000000001",
    expectedQuantity: new Prisma.Decimal(10),
    countedQuantity: new Prisma.Decimal(12),
    variance: new Prisma.Decimal(2),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      createWithLines: jest
        .fn()
        .mockResolvedValue(createCount(InventoryCountStatus.DRAFT, [line])),
      findById: jest
        .fn()
        .mockResolvedValue(
          createCount(InventoryCountStatus.IN_PROGRESS, [line]),
        ),
      findByWorkspace: jest.fn().mockResolvedValue([]),
      updateLine: jest.fn().mockResolvedValue(line),
      transitionStatus: jest
        .fn()
        .mockResolvedValue(
          createCount(InventoryCountStatus.IN_PROGRESS, [line]),
        ),
      complete: jest
        .fn()
        .mockResolvedValue(
          createCount(InventoryCountStatus.COMPLETED, [line]),
        ),
      warehouseBelongsToWorkspace: jest.fn().mockResolvedValue(true),
      findStorageLocation: jest
        .fn()
        .mockResolvedValue({ id: storageLocationId, warehouseId }),
    } as unknown as jest.Mocked<InventoryCountsRepository>;

    service = new InventoryCountsService(repository);
  });

  it("creates a location count with a normalized code", async () => {
    await service.create(workspaceId, {
      warehouseId,
      storageLocationId,
      code: " count-001 ",
      description: "Monthly count",
    });

    expect(repository.createWithLines).toHaveBeenCalledWith({
      workspaceId,
      warehouseId,
      storageLocationId,
      code: "COUNT-001",
      description: "Monthly count",
    });
  });

  it("rejects a storage location from another warehouse", async () => {
    repository.findStorageLocation.mockResolvedValueOnce({
      id: storageLocationId,
      warehouseId: "20000000-0000-4000-8000-000000000099",
    });

    await expect(
      service.create(workspaceId, {
        warehouseId,
        storageLocationId,
        code: "COUNT-001",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.createWithLines).not.toHaveBeenCalled();
  });

  it("records counted quantity and calculates variance server-side", async () => {
    await service.updateLine(workspaceId, inventoryCountId, lineId, {
      countedQuantity: 7,
    });

    const call = repository.updateLine.mock.calls[0];
    expect(call.slice(0, 3)).toEqual([
      workspaceId,
      inventoryCountId,
      lineId,
    ]);
    expect(call[3].toString()).toBe("7");
    expect(call[4].toString()).toBe("-3");
  });

  it("rejects line changes once the count is completed", async () => {
    repository.findById.mockResolvedValueOnce(
      createCount(InventoryCountStatus.COMPLETED, [line]),
    );

    await expect(
      service.updateLine(workspaceId, inventoryCountId, lineId, {
        countedQuantity: 7,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.updateLine).not.toHaveBeenCalled();
  });

  it("starts a draft inventory count", async () => {
    repository.findById.mockResolvedValueOnce(
      createCount(InventoryCountStatus.DRAFT, [line]),
    );

    await service.start(workspaceId, inventoryCountId);

    expect(repository.transitionStatus).toHaveBeenCalledWith(
      workspaceId,
      inventoryCountId,
      InventoryCountStatus.DRAFT,
      InventoryCountStatus.IN_PROGRESS,
    );
  });

  it("completes a fully counted inventory", async () => {
    const result = await service.complete(workspaceId, inventoryCountId);

    expect(result.status).toBe(InventoryCountStatus.COMPLETED);
    expect(repository.complete).toHaveBeenCalledWith(
      workspaceId,
      inventoryCountId,
    );
  });

  it("rejects completion when one line has not been counted", async () => {
    repository.findById.mockResolvedValueOnce(
      createCount(InventoryCountStatus.IN_PROGRESS, [
        { ...line, countedQuantity: null, variance: null },
      ]),
    );

    await expect(
      service.complete(workspaceId, inventoryCountId),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.complete).not.toHaveBeenCalled();
  });

  it("cancels an in-progress inventory count", async () => {
    repository.transitionStatus.mockResolvedValueOnce(
      createCount(InventoryCountStatus.CANCELLED, [line]),
    );

    const result = await service.cancel(workspaceId, inventoryCountId);

    expect(result.status).toBe(InventoryCountStatus.CANCELLED);
    expect(repository.transitionStatus).toHaveBeenCalledWith(
      workspaceId,
      inventoryCountId,
      InventoryCountStatus.IN_PROGRESS,
      InventoryCountStatus.CANCELLED,
    );
  });

  it("keeps completed inventory counts immutable", async () => {
    repository.findById.mockResolvedValueOnce(
      createCount(InventoryCountStatus.COMPLETED, [line]),
    );

    await expect(
      service.cancel(workspaceId, inventoryCountId),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("preserves workspace isolation when loading a count", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.get(workspaceId, inventoryCountId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  function createCount(
    status: InventoryCountStatus,
    lines: InventoryCountLineRecord[],
  ) {
    return {
      id: inventoryCountId,
      workspaceId,
      warehouseId,
      storageLocationId,
      code: "COUNT-001",
      status,
      description: "Monthly count",
      completedAt:
        status === InventoryCountStatus.COMPLETED
          ? new Date("2026-01-02T00:00:00.000Z")
          : null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      lines,
    };
  }
});
