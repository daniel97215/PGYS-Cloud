import { Module } from "@nestjs/common";
import { MarketingCampaignsModule } from "../marketing-campaigns/marketing-campaigns.module";
import { MarketingAutomationsController } from "./marketing-automations.controller";
import { MarketingAutomationsRepository } from "./marketing-automations.repository";
import { MarketingAutomationsService } from "./marketing-automations.service";

@Module({ imports: [MarketingCampaignsModule], controllers: [MarketingAutomationsController], providers: [MarketingAutomationsRepository, MarketingAutomationsService] })
export class MarketingAutomationsModule {}
