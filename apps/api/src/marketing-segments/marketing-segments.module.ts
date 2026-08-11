import { Module } from "@nestjs/common";
import { BusinessPartnerSearchModule } from "../business-partner-search/business-partner-search.module";
import { MarketingSegmentsController } from "./marketing-segments.controller";
import { MarketingSegmentsRepository } from "./marketing-segments.repository";
import { MarketingSegmentsService } from "./marketing-segments.service";

@Module({
  imports: [BusinessPartnerSearchModule],
  controllers: [MarketingSegmentsController],
  providers: [MarketingSegmentsRepository, MarketingSegmentsService],
  exports: [MarketingSegmentsService],
})
export class MarketingSegmentsModule {}
