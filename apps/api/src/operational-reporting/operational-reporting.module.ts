import { Module } from "@nestjs/common";
import { OperationalReportingController } from "./operational-reporting.controller";
import { OperationalReportingRepository } from "./operational-reporting.repository";
import { OperationalReportingService } from "./operational-reporting.service";

@Module({
  controllers: [OperationalReportingController],
  providers: [OperationalReportingRepository, OperationalReportingService],
})
export class OperationalReportingModule {}
