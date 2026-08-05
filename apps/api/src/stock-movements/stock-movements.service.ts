import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, StockMovementDirection } from "@prisma/client";
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";
import {
  StockMovementInventoryItem,
  StockMovementRecord,
  StockMovementsRepository,
  StockTransferMovements,
  StockTransferRejectedError,
  StockUpdateRejectedError,
} from "./stock-movements.repository";

export interface CreateStockTransferCommand {
  sourceInventoryItemId: string;
  destinationInventoryItemId: string;
  quantity: number;
  referenceId: string;
  reason?: string;
}

@Injectable()
export class StockMovementsService {
  constructor(
    private readonly stockMovementsRepository: StockMovementsRepository,
  ) {}

  async create(
    workspaceId: string,
    data: CreateStockMovementDto,
  ): Promise<StockMovementRecord> {
    const inventoryItem = await this.requireActiveInventoryItem(
      workspaceId,
      data.inventoryItemId,
    );
    const quantity = new Prisma.Decimal(data.quantity);

    if (quantity.lessThanOrEqualTo(0)) {
      throw new BadRequestException("Movement quantity must be positive");
    }

    if (
      data.direction === StockMovementDirection.OUT &&
      quantity.greaterThan(inventoryItem.quantityOnHand)
    ) {
      throw new BadRequestException("Insufficient stock");
    }

    try {
      return await this.stockMovementsRepository.createMovementAndUpdateStock({
        workspaceId,
        inventoryItemId: data.inventoryItemId,
        direction: data.direction,
        quantity,
        ...(data.reason === undefined ? {} : { reason: data.reason }),
        ...(data.referenceType === undefined
          ? {}
          : { referenceType: data.referenceType }),
        ...(data.referenceId === undefined
          ? {}
          : { referenceId: data.referenceId }),
        ...(data.occurredAt === undefined
          ? {}
          : { occurredAt: new Date(data.occurredAt) }),
      });
    } catch (error) {
      if (error instanceof StockUpdateRejectedError) {
        throw new BadRequestException(
          "Stock update rejected because the item is inactive or stock is insufficient",
        );
      }

      throw error;
    }
  }

  async get(workspaceId: string, id: string): Promise<StockMovementRecord> {
    const movement = await this.stockMovementsRepository.findById(
      workspaceId,
      id,
    );

    if (!movement) {
      throw new NotFoundException(`Stock movement "${id}" not found`);
    }

    return movement;
  }

  async createTransfer(
    workspaceId: string,
    data: CreateStockTransferCommand,
  ): Promise<StockTransferMovements> {
    if (data.sourceInventoryItemId === data.destinationInventoryItemId) {
      throw new BadRequestException(
        "Source and destination inventory items must be different",
      );
    }

    const quantity = new Prisma.Decimal(data.quantity);

    if (quantity.lessThanOrEqualTo(0)) {
      throw new BadRequestException("Transfer quantity must be positive");
    }

    const [source, destination] = await Promise.all([
      this.requireInventoryItem(workspaceId, data.sourceInventoryItemId),
      this.requireInventoryItem(workspaceId, data.destinationInventoryItemId),
    ]);

    if (!source.isActive || !destination.isActive) {
      throw new BadRequestException(
        "Source and destination inventory items must be active",
      );
    }

    if (
      source.productId !== destination.productId ||
      source.productVariantId !== destination.productVariantId
    ) {
      throw new BadRequestException(
        "Source and destination must reference the same product and variant",
      );
    }

    if (quantity.greaterThan(source.quantityOnHand)) {
      throw new BadRequestException("Insufficient source stock");
    }

    const reason = data.reason?.trim();

    try {
      return await this.stockMovementsRepository.createTransferAndUpdateStock({
        workspaceId,
        sourceInventoryItemId: data.sourceInventoryItemId,
        destinationInventoryItemId: data.destinationInventoryItemId,
        quantity,
        referenceId: data.referenceId,
        ...(reason ? { reason } : {}),
      });
    } catch (error) {
      if (error instanceof StockTransferRejectedError) {
        throw new BadRequestException(
          "Transfer rejected because an item is inactive or source stock is insufficient",
        );
      }

      throw error;
    }
  }

  async listByInventoryItem(
    workspaceId: string,
    inventoryItemId: string,
  ): Promise<StockMovementRecord[]> {
    await this.requireInventoryItem(workspaceId, inventoryItemId);
    return this.stockMovementsRepository.findByInventoryItem(
      workspaceId,
      inventoryItemId,
    );
  }

  list(workspaceId: string): Promise<StockMovementRecord[]> {
    return this.stockMovementsRepository.findByWorkspace(workspaceId);
  }

  private async requireActiveInventoryItem(
    workspaceId: string,
    inventoryItemId: string,
  ): Promise<StockMovementInventoryItem> {
    const inventoryItem = await this.requireInventoryItem(
      workspaceId,
      inventoryItemId,
    );

    if (!inventoryItem.isActive) {
      throw new BadRequestException("Inventory item is inactive");
    }

    return inventoryItem;
  }

  private async requireInventoryItem(
    workspaceId: string,
    inventoryItemId: string,
  ): Promise<StockMovementInventoryItem> {
    const inventoryItem = await this.stockMovementsRepository.findInventoryItem(
      workspaceId,
      inventoryItemId,
    );

    if (!inventoryItem) {
      throw new NotFoundException(
        `Inventory item "${inventoryItemId}" not found`,
      );
    }

    return inventoryItem;
  }
}
