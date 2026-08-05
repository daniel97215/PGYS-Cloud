import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InventoryCountStatus, Prisma } from "@prisma/client";
import { CreateInventoryCountDto } from "./dto/create-inventory-count.dto";
import { UpdateInventoryCountLineDto } from "./dto/update-inventory-count-line.dto";
import {
  IncompleteInventoryCountError,
  InventoryCountLineRecord,
  InventoryCountRecord,
  InventoryCountsRepository,
  InventoryCountStateConflictError,
  InventoryCountStockUpdateError,
  InventoryCountWithLines,
} from "./inventory-counts.repository";

@Injectable()
export class InventoryCountsService {
  constructor(
    private readonly inventoryCountsRepository: InventoryCountsRepository,
  ) {}

  async create(
    workspaceId: string,
    data: CreateInventoryCountDto,
  ): Promise<InventoryCountWithLines> {
    const [warehouseExists, storageLocation] = await Promise.all([
      this.inventoryCountsRepository.warehouseBelongsToWorkspace(
        workspaceId,
        data.warehouseId,
      ),
      this.inventoryCountsRepository.findStorageLocation(
        workspaceId,
        data.storageLocationId,
      ),
    ]);

    if (!warehouseExists) {
      throw new NotFoundException(`Warehouse "${data.warehouseId}" not found`);
    }

    if (!storageLocation) {
      throw new NotFoundException(
        `Storage location "${data.storageLocationId}" not found`,
      );
    }

    if (storageLocation.warehouseId !== data.warehouseId) {
      throw new BadRequestException(
        "Storage location does not belong to the specified warehouse",
      );
    }

    return this.inventoryCountsRepository.createWithLines({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
    });
  }

  get(workspaceId: string, id: string): Promise<InventoryCountWithLines> {
    return this.requireInventoryCount(workspaceId, id);
  }

  list(workspaceId: string): Promise<InventoryCountRecord[]> {
    return this.inventoryCountsRepository.findByWorkspace(workspaceId);
  }

  async updateLine(
    workspaceId: string,
    inventoryCountId: string,
    lineId: string,
    data: UpdateInventoryCountLineDto,
  ): Promise<InventoryCountLineRecord> {
    const inventoryCount = await this.requireInventoryCount(
      workspaceId,
      inventoryCountId,
    );

    if (inventoryCount.status !== InventoryCountStatus.IN_PROGRESS) {
      throw new BadRequestException(
        "Inventory count lines can only be updated while in progress",
      );
    }

    const line = inventoryCount.lines.find((candidate) => candidate.id === lineId);

    if (!line) {
      throw new NotFoundException(`Inventory count line "${lineId}" not found`);
    }

    const countedQuantity = new Prisma.Decimal(data.countedQuantity);

    if (countedQuantity.isNegative()) {
      throw new BadRequestException("Counted quantity cannot be negative");
    }

    return this.inventoryCountsRepository.updateLine(
      workspaceId,
      inventoryCountId,
      lineId,
      countedQuantity,
      countedQuantity.minus(line.expectedQuantity),
    );
  }

  async start(
    workspaceId: string,
    id: string,
  ): Promise<InventoryCountRecord> {
    const inventoryCount = await this.requireInventoryCount(workspaceId, id);

    if (inventoryCount.status !== InventoryCountStatus.DRAFT) {
      throw new BadRequestException("Only a draft inventory count can start");
    }

    return this.requireStatusTransition(
      workspaceId,
      id,
      InventoryCountStatus.DRAFT,
      InventoryCountStatus.IN_PROGRESS,
    );
  }

  async complete(
    workspaceId: string,
    id: string,
  ): Promise<InventoryCountWithLines> {
    const inventoryCount = await this.requireInventoryCount(workspaceId, id);

    if (inventoryCount.status !== InventoryCountStatus.IN_PROGRESS) {
      throw new BadRequestException(
        "Only an in-progress inventory count can be completed",
      );
    }

    if (inventoryCount.lines.some((line) => line.countedQuantity === null)) {
      throw new BadRequestException(
        "Every inventory count line must be counted",
      );
    }

    try {
      return await this.inventoryCountsRepository.complete(workspaceId, id);
    } catch (error) {
      if (
        error instanceof InventoryCountStateConflictError ||
        error instanceof IncompleteInventoryCountError ||
        error instanceof InventoryCountStockUpdateError
      ) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  async cancel(
    workspaceId: string,
    id: string,
  ): Promise<InventoryCountRecord> {
    const inventoryCount = await this.requireInventoryCount(workspaceId, id);

    if (
      inventoryCount.status === InventoryCountStatus.COMPLETED ||
      inventoryCount.status === InventoryCountStatus.CANCELLED
    ) {
      throw new BadRequestException(
        "Completed or cancelled inventory counts are immutable",
      );
    }

    return this.requireStatusTransition(
      workspaceId,
      id,
      inventoryCount.status,
      InventoryCountStatus.CANCELLED,
    );
  }

  private async requireStatusTransition(
    workspaceId: string,
    id: string,
    fromStatus: InventoryCountStatus,
    toStatus: InventoryCountStatus,
  ): Promise<InventoryCountRecord> {
    const inventoryCount =
      await this.inventoryCountsRepository.transitionStatus(
        workspaceId,
        id,
        fromStatus,
        toStatus,
      );

    if (!inventoryCount) {
      throw new BadRequestException(
        "Inventory count state changed concurrently",
      );
    }

    return inventoryCount;
  }

  private async requireInventoryCount(
    workspaceId: string,
    id: string,
  ): Promise<InventoryCountWithLines> {
    const inventoryCount = await this.inventoryCountsRepository.findById(
      workspaceId,
      id,
    );

    if (!inventoryCount) {
      throw new NotFoundException(`Inventory count "${id}" not found`);
    }

    return inventoryCount;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Inventory count code is required");
    }

    return normalizedCode;
  }
}
