import { Module } from "@nestjs/common";
import { CrmReportingController } from "./crm-reporting.controller";
import { CrmReportingRepository } from "./crm-reporting.repository";
import { CrmReportingService } from "./crm-reporting.service";

@Module({
  controllers: [CrmReportingController],
  providers: [CrmReportingRepository, CrmReportingService],
})
export class CrmReportingModule {}
