import { Module } from "@nestjs/common";
import { StockMovementsModule } from "../stock-movements/stock-movements.module";
import { InventoryAdjustmentsController } from "./inventory-adjustments.controller";
import { InventoryAdjustmentsService } from "./inventory-adjustments.service";

@Module({
  imports: [StockMovementsModule],
  controllers: [InventoryAdjustmentsController],
  providers: [InventoryAdjustmentsService],
})
export class InventoryAdjustmentsModule {}
