import { Module } from "@nestjs/common";
import { ManufacturersController } from "./manufacturers.controller";
import { ManufacturersRepository } from "./manufacturers.repository";
import { ManufacturersService } from "./manufacturers.service";

@Module({
  controllers: [ManufacturersController],
  providers: [ManufacturersRepository, ManufacturersService],
})
export class ManufacturersModule {}
