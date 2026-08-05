import { Module } from "@nestjs/common";
import { WarehousesController } from "./warehouses.controller";
import { WarehousesRepository } from "./warehouses.repository";
import { WarehousesService } from "./warehouses.service";

@Module({
  controllers: [WarehousesController],
  providers: [WarehousesRepository, WarehousesService],
})
export class WarehousesModule {}
