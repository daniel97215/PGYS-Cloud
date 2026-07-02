import { Module } from "@nestjs/common";
import { OffersController } from "./offers.controller";
import { OffersRepository } from "./offers.repository";
import { OffersService } from "./offers.service";

@Module({
  controllers: [OffersController],
  providers: [OffersRepository, OffersService],
})
export class OffersModule {}
