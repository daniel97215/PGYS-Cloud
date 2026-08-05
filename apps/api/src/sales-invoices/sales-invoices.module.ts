import { Module } from "@nestjs/common";
import { SalesInvoicesController } from "./sales-invoices.controller";
import { SalesInvoicesRepository } from "./sales-invoices.repository";
import { SalesInvoicesService } from "./sales-invoices.service";

@Module({
  controllers: [SalesInvoicesController],
  providers: [SalesInvoicesRepository, SalesInvoicesService],
})
export class SalesInvoicesModule {}
