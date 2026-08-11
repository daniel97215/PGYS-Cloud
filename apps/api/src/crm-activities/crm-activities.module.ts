import { Module } from "@nestjs/common";
import { CrmOpportunitiesModule } from "../crm-opportunities/crm-opportunities.module";
import { CrmActivitiesController } from "./crm-activities.controller";
import { CrmActivitiesRepository } from "./crm-activities.repository";
import { CrmActivitiesService } from "./crm-activities.service";

@Module({
  imports: [CrmOpportunitiesModule],
  controllers: [CrmActivitiesController],
  providers: [CrmActivitiesRepository, CrmActivitiesService],
})
export class CrmActivitiesModule {}
