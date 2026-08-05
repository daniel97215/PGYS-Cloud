import { Module } from "@nestjs/common";
import { StockMovementsModule } from "../stock-movements/stock-movements.module";
import { StockTransfersController } from "./stock-transfers.controller";
import { StockTransfersService } from "./stock-transfers.service";

@Module({
  imports: [StockMovementsModule],
  controllers: [StockTransfersController],
  providers: [StockTransfersService],
})
export class StockTransfersModule {}
