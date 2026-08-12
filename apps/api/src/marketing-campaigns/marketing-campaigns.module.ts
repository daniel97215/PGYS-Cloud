import { Module } from "@nestjs/common";
import { MarketingSegmentsModule } from "../marketing-segments/marketing-segments.module";
import { MarketingCampaignsController } from "./marketing-campaigns.controller";
import { MarketingCampaignsRepository } from "./marketing-campaigns.repository";
import { MarketingCampaignsService } from "./marketing-campaigns.service";
import { MarketingTemplatesController } from "./marketing-templates.controller";

@Module({ imports: [MarketingSegmentsModule], controllers: [MarketingCampaignsController, MarketingTemplatesController], providers: [MarketingCampaignsRepository, MarketingCampaignsService], exports: [MarketingCampaignsService] })
export class MarketingCampaignsModule {}
