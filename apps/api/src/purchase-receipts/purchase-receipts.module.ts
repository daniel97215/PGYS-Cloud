import { Module } from "@nestjs/common";
import { PurchaseOrdersModule } from "../purchase-orders/purchase-orders.module";
import { StockMovementsModule } from "../stock-movements/stock-movements.module";
import { PurchaseReceiptsController } from "./purchase-receipts.controller";
import { PurchaseReceiptsRepository } from "./purchase-receipts.repository";
import { PurchaseReceiptsService } from "./purchase-receipts.service";

@Module({
  imports: [PurchaseOrdersModule, StockMovementsModule],
  controllers: [PurchaseReceiptsController],
  providers: [PurchaseReceiptsRepository, PurchaseReceiptsService],
  exports: [PurchaseReceiptsRepository],
})
export class PurchaseReceiptsModule {}
