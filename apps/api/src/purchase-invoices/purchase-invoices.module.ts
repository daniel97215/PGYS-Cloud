import { Module } from "@nestjs/common";
import { PurchaseInvoicesController } from "./purchase-invoices.controller";
import { PurchaseInvoicesRepository } from "./purchase-invoices.repository";
import { PurchaseInvoicesService } from "./purchase-invoices.service";

@Module({
  controllers: [PurchaseInvoicesController],
  providers: [PurchaseInvoicesRepository, PurchaseInvoicesService],
  exports: [PurchaseInvoicesRepository],
})
export class PurchaseInvoicesModule {}
