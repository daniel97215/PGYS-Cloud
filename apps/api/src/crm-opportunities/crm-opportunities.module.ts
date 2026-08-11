import { Module } from "@nestjs/common";
import { CrmPipelinesModule } from "../crm-pipelines/crm-pipelines.module";
import { CrmOpportunitiesController } from "./crm-opportunities.controller";
import { CrmOpportunitiesRepository } from "./crm-opportunities.repository";
import { CrmOpportunitiesService } from "./crm-opportunities.service";

@Module({
  imports: [CrmPipelinesModule],
  controllers: [CrmOpportunitiesController],
  providers: [CrmOpportunitiesRepository, CrmOpportunitiesService],
  exports: [CrmOpportunitiesService],
})
export class CrmOpportunitiesModule {}
