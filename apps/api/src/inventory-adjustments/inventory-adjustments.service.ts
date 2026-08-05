import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, StockMovementDirection } from "@prisma/client";
import {
  StockMovementRecord,
} from "../stock-movements/stock-movements.repository";
import { StockMovementsService } from "../stock-movements/stock-movements.service";
import { CreateInventoryAdjustmentDto } from "./dto/create-inventory-adjustment.dto";

export interface InventoryAdjustmentResult {
  movement: StockMovementRecord;
  quantityOnHand: Prisma.Decimal;
}

@Injectable()
export class InventoryAdjustmentsService {
  constructor(
    private readonly stockMovementsService: StockMovementsService,
  ) {}

  async create(
    data: CreateInventoryAdjustmentDto,
  ): Promise<InventoryAdjustmentResult> {
    const reason = data.reason.trim();

    if (reason.length === 0 || reason.length > 500) {
      throw new BadRequestException(
        "Adjustment reason is required and must not exceed 500 characters",
      );
    }

    const countedQuantity = new Prisma.Decimal(data.countedQuantity);

    if (countedQuantity.isNegative()) {
      throw new BadRequestException("Counted quantity cannot be negative");
    }

    const movements = await this.stockMovementsService.listByInventoryItem(
      data.workspaceId,
      data.inventoryItemId,
    );
    const quantityOnHand =
      movements[0]?.quantityAfter ?? new Prisma.Decimal(0);

    if (countedQuantity.equals(quantityOnHand)) {
      throw new BadRequestException(
        "Counted quantity is identical to current stock",
      );
    }

    const direction = countedQuantity.greaterThan(quantityOnHand)
      ? StockMovementDirection.IN
      : StockMovementDirection.OUT;
    const difference = countedQuantity.minus(quantityOnHand).abs();

    const movement = await this.stockMovementsService.create(data.workspaceId, {
      inventoryItemId: data.inventoryItemId,
      direction,
      quantity: Number(difference.toString()),
      reason,
      referenceType: "INVENTORY_ADJUSTMENT",
    });

    return {
      movement,
      quantityOnHand: movement.quantityAfter,
    };
  }
}
