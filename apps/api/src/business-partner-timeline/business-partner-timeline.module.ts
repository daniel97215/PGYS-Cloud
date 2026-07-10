import { Module } from "@nestjs/common";
import { BusinessPartnerTimelineController } from "./business-partner-timeline.controller";
import { BusinessPartnerTimelineRepository } from "./business-partner-timeline.repository";
import { BusinessPartnerTimelineService } from "./business-partner-timeline.service";

@Module({
  controllers: [BusinessPartnerTimelineController],
  providers: [BusinessPartnerTimelineRepository, BusinessPartnerTimelineService],
})
export class BusinessPartnerTimelineModule {}
