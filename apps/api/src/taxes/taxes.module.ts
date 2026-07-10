import { Module } from "@nestjs/common";
import { TaxesController } from "./taxes.controller";
import { TaxesRepository } from "./taxes.repository";
import { TaxesService } from "./taxes.service";

@Module({
  controllers: [TaxesController],
  providers: [TaxesRepository, TaxesService],
})
export class TaxesModule {}
