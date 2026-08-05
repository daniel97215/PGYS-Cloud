import { Module } from "@nestjs/common";
import { StockReservationsController } from "./stock-reservations.controller";
import { StockReservationsRepository } from "./stock-reservations.repository";
import { StockReservationsService } from "./stock-reservations.service";

@Module({
  controllers: [StockReservationsController],
  providers: [StockReservationsRepository, StockReservationsService],
})
export class StockReservationsModule {}
