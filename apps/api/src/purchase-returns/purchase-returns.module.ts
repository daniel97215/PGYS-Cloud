import { Module } from "@nestjs/common";
import { PurchaseReceiptsModule } from "../purchase-receipts/purchase-receipts.module";
import { StockMovementsModule } from "../stock-movements/stock-movements.module";
import { PurchaseReturnsController } from "./purchase-returns.controller";
import { PurchaseReturnsRepository } from "./purchase-returns.repository";
import { PurchaseReturnsService } from "./purchase-returns.service";

@Module({
  imports: [PurchaseReceiptsModule, StockMovementsModule],
  controllers: [PurchaseReturnsController],
  providers: [PurchaseReturnsRepository, PurchaseReturnsService],
})
export class PurchaseReturnsModule {}
