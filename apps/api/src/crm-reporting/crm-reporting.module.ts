import { Module } from "@nestjs/common";
import { CrmReportingController } from "./crm-reporting.controller";
import { CrmReportingSummaryController } from "./crm-reporting-summary.controller";
import { CrmReportingRepository } from "./crm-reporting.repository";
import { CrmReportingService } from "./crm-reporting.service";

@Module({
  controllers: [CrmReportingController, CrmReportingSummaryController],
  providers: [CrmReportingRepository, CrmReportingService],
})
export class CrmReportingModule {}
