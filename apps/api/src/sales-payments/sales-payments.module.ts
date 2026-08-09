import { Module } from "@nestjs/common";
import { SalesPaymentsController } from "./sales-payments.controller";
import { SalesPaymentsRepository } from "./sales-payments.repository";
import { SalesPaymentsService } from "./sales-payments.service";

@Module({
  controllers: [SalesPaymentsController],
  providers: [SalesPaymentsRepository, SalesPaymentsService],
})
export class SalesPaymentsModule {}
