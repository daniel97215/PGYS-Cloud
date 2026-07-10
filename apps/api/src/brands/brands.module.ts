import { Module } from "@nestjs/common";
import { BrandsController } from "./brands.controller";
import { BrandsRepository } from "./brands.repository";
import { BrandsService } from "./brands.service";

@Module({
  controllers: [BrandsController],
  providers: [BrandsRepository, BrandsService],
})
export class BrandsModule {}
