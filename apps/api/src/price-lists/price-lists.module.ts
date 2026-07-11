import { Module } from "@nestjs/common";
import { PriceListsController } from "./price-lists.controller";
import { PriceListsRepository } from "./price-lists.repository";
import { PriceListsService } from "./price-lists.service";

@Module({
  controllers: [PriceListsController],
  providers: [PriceListsRepository, PriceListsService],
})
export class PriceListsModule {}
