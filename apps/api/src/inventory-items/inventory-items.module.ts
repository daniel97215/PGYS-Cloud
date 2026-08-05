import { Module } from "@nestjs/common";
import { InventoryItemsController } from "./inventory-items.controller";
import { InventoryItemsRepository } from "./inventory-items.repository";
import { InventoryItemsService } from "./inventory-items.service";

@Module({
  controllers: [InventoryItemsController],
  providers: [InventoryItemsRepository, InventoryItemsService],
})
export class InventoryItemsModule {}
