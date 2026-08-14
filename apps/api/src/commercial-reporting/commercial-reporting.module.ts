import { Module } from "@nestjs/common";
import { CommercialReportingController } from "./commercial-reporting.controller";
import { CommercialReportingRepository } from "./commercial-reporting.repository";
import { CommercialReportingService } from "./commercial-reporting.service";

@Module({
  controllers: [CommercialReportingController],
  providers: [CommercialReportingRepository, CommercialReportingService],
})
export class CommercialReportingModule {}
