import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, StockReservationStatus } from "@prisma/client";
import { CreateStockReservationDto } from "./dto/create-stock-reservation.dto";
import {
  ConsumedStockReservation,
  StockReservationOperationRejectedError,
  StockReservationRecord,
  StockReservationsRepository,
} from "./stock-reservations.repository";

@Injectable()
export class StockReservationsService {
  constructor(
    private readonly stockReservationsRepository: StockReservationsRepository,
  ) {}

  async create(
    workspaceId: string,
    data: CreateStockReservationDto,
  ): Promise<StockReservationRecord> {
    const inventoryItem = await this.requireInventoryItem(
      workspaceId,
      data.inventoryItemId,
    );

    if (!inventoryItem.isActive) {
      throw new BadRequestException("Inventory item is inactive");
    }

    const quantity = new Prisma.Decimal(data.quantity);

    if (quantity.lessThanOrEqualTo(0)) {
      throw new BadRequestException("Reservation quantity must be positive");
    }

    const availableQuantity = inventoryItem.quantityOnHand.minus(
      inventoryItem.quantityReserved,
    );

    if (quantity.greaterThan(availableQuantity)) {
      throw new BadRequestException("Insufficient available stock");
    }

    try {
      return await this.stockReservationsRepository.createAndReserve({
        workspaceId,
        inventoryItemId: data.inventoryItemId,
        quantity,
        ...(data.referenceType === undefined
          ? {}
          : { referenceType: data.referenceType }),
        ...(data.referenceId === undefined
          ? {}
          : { referenceId: data.referenceId }),
        ...(data.expiresAt === undefined
          ? {}
          : { expiresAt: new Date(data.expiresAt) }),
      });
    } catch (error) {
      return this.mapOperationError(error);
    }
  }

  release(
    workspaceId: string,
    id: string,
  ): Promise<StockReservationRecord> {
    return this.changeActiveStatus(
      workspaceId,
      id,
      StockReservationStatus.RELEASED,
    );
  }

  cancel(
    workspaceId: string,
    id: string,
  ): Promise<StockReservationRecord> {
    return this.changeActiveStatus(
      workspaceId,
      id,
      StockReservationStatus.CANCELLED,
    );
  }

  async consume(
    workspaceId: string,
    id: string,
  ): Promise<ConsumedStockReservation> {
    await this.requireActiveReservation(workspaceId, id);

    try {
      return await this.stockReservationsRepository.consume(workspaceId, id);
    } catch (error) {
      return this.mapOperationError(error);
    }
  }

  get(workspaceId: string, id: string): Promise<StockReservationRecord> {
    return this.requireReservation(workspaceId, id);
  }

  async listByInventoryItem(
    workspaceId: string,
    inventoryItemId: string,
  ): Promise<StockReservationRecord[]> {
    await this.requireInventoryItem(workspaceId, inventoryItemId);
    return this.stockReservationsRepository.findByInventoryItem(
      workspaceId,
      inventoryItemId,
    );
  }

  list(workspaceId: string): Promise<StockReservationRecord[]> {
    return this.stockReservationsRepository.findByWorkspace(workspaceId);
  }

  private async changeActiveStatus(
    workspaceId: string,
    id: string,
    status:
      | typeof StockReservationStatus.RELEASED
      | typeof StockReservationStatus.CANCELLED,
  ): Promise<StockReservationRecord> {
    await this.requireActiveReservation(workspaceId, id);

    try {
      return await this.stockReservationsRepository.release(
        workspaceId,
        id,
        status,
      );
    } catch (error) {
      return this.mapOperationError(error);
    }
  }

  private async requireActiveReservation(
    workspaceId: string,
    id: string,
  ): Promise<StockReservationRecord> {
    const reservation = await this.requireReservation(workspaceId, id);

    if (reservation.status !== StockReservationStatus.ACTIVE) {
      throw new BadRequestException("Stock reservation is not active");
    }

    return reservation;
  }

  private async requireReservation(
    workspaceId: string,
    id: string,
  ): Promise<StockReservationRecord> {
    const reservation = await this.stockReservationsRepository.findById(
      workspaceId,
      id,
    );

    if (!reservation) {
      throw new NotFoundException(`Stock reservation "${id}" not found`);
    }

    return reservation;
  }

  private async requireInventoryItem(
    workspaceId: string,
    inventoryItemId: string,
  ) {
    const inventoryItem =
      await this.stockReservationsRepository.findInventoryItem(
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

  private mapOperationError(error: unknown): never {
    if (error instanceof StockReservationOperationRejectedError) {
      throw new BadRequestException(
        "Reservation operation rejected because state or stock changed",
      );
    }

    throw error;
  }
}
