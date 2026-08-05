import { Module } from "@nestjs/common";
import { InventoryCountsController } from "./inventory-counts.controller";
import { InventoryCountsRepository } from "./inventory-counts.repository";
import { InventoryCountsService } from "./inventory-counts.service";

@Module({
  controllers: [InventoryCountsController],
  providers: [InventoryCountsRepository, InventoryCountsService],
})
export class InventoryCountsModule {}
