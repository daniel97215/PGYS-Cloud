import { Module } from "@nestjs/common";
import { SalesQuotesController } from "./sales-quotes.controller";
import { SalesQuotesRepository } from "./sales-quotes.repository";
import { SalesQuotesService } from "./sales-quotes.service";

@Module({
  controllers: [SalesQuotesController],
  providers: [SalesQuotesRepository, SalesQuotesService],
})
export class SalesQuotesModule {}
