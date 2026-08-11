import { Module } from "@nestjs/common";
import { CrmPipelineStagesController } from "./crm-pipeline-stages.controller";
import { CrmPipelinesController } from "./crm-pipelines.controller";
import { CrmPipelinesRepository } from "./crm-pipelines.repository";
import { CrmPipelinesService } from "./crm-pipelines.service";

@Module({
  controllers: [CrmPipelinesController, CrmPipelineStagesController],
  providers: [CrmPipelinesRepository, CrmPipelinesService],
})
export class CrmPipelinesModule {}
