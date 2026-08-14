import { Module } from "@nestjs/common";
import { ErpReportingController } from "./erp-reporting.controller";
import { ErpReportingRepository } from "./erp-reporting.repository";
import { ErpReportingService } from "./erp-reporting.service";

@Module({
  controllers: [ErpReportingController],
  providers: [ErpReportingRepository, ErpReportingService],
})
export class ErpReportingModule {}
