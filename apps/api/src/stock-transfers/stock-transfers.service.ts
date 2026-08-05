import { BadRequestException, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { StockMovementRecord } from "../stock-movements/stock-movements.repository";
import { StockMovementsService } from "../stock-movements/stock-movements.service";
import { CreateStockTransferDto } from "./dto/create-stock-transfer.dto";

export interface StockTransferResult {
  referenceId: string;
  outMovement: StockMovementRecord;
  inMovement: StockMovementRecord;
}

@Injectable()
export class StockTransfersService {
  constructor(
    private readonly stockMovementsService: StockMovementsService,
  ) {}

  async create(data: CreateStockTransferDto): Promise<StockTransferResult> {
    const reason = data.reason?.trim();

    if (reason && reason.length > 500) {
      throw new BadRequestException(
        "Transfer reason must not exceed 500 characters",
      );
    }

    const referenceId = randomUUID();
    const { outMovement, inMovement } =
      await this.stockMovementsService.createTransfer(data.workspaceId, {
        sourceInventoryItemId: data.sourceInventoryItemId,
        destinationInventoryItemId: data.destinationInventoryItemId,
        quantity: data.quantity,
        referenceId,
        ...(reason ? { reason } : {}),
      });

    return { referenceId, outMovement, inMovement };
  }
}
