import { Module } from "@nestjs/common";
import { SalesDeliveriesController } from "./sales-deliveries.controller";
import { SalesDeliveriesRepository } from "./sales-deliveries.repository";
import { SalesDeliveriesService } from "./sales-deliveries.service";

@Module({
  controllers: [SalesDeliveriesController],
  providers: [SalesDeliveriesRepository, SalesDeliveriesService],
})
export class SalesDeliveriesModule {}
