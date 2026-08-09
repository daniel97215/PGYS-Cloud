import { Module } from "@nestjs/common";
import { PurchaseInvoicesModule } from "../purchase-invoices/purchase-invoices.module";
import { PurchasePaymentsController } from "./purchase-payments.controller";
import { PurchasePaymentsRepository } from "./purchase-payments.repository";
import { PurchasePaymentsService } from "./purchase-payments.service";

@Module({
  imports: [PurchaseInvoicesModule],
  controllers: [PurchasePaymentsController],
  providers: [PurchasePaymentsRepository, PurchasePaymentsService],
})
export class PurchasePaymentsModule {}
