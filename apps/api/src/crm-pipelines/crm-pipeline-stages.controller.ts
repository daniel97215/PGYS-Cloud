import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CreateCrmPipelineStageDto } from "./dto/create-crm-pipeline-stage.dto";
import { UpdateCrmPipelineStageDto } from "./dto/update-crm-pipeline-stage.dto";
import { CrmPipelinesService } from "./crm-pipelines.service";

@ApiTags("CRM Pipeline Stages")
@Controller("workspaces/:workspaceId/crm/pipelines/:pipelineCode/stages")
export class CrmPipelineStagesController {
  constructor(private readonly service: CrmPipelinesService) {}

  @ApiOperation({ summary: "Create a CRM pipeline stage" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "pipelineCode" })
  @ApiBody({ type: CreateCrmPipelineStageDto })
  @ApiCreatedResponse({ description: "CRM pipeline stage created" })
  @ApiNotFoundResponse({ description: "CRM pipeline not found" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("pipelineCode") pipelineCode: string,
    @Body() data: CreateCrmPipelineStageDto,
  ) {
    return this.service.createStage(workspaceId, pipelineCode, data);
  }

  @ApiOperation({ summary: "List CRM pipeline stages" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "pipelineCode" })
  @ApiOkResponse({ description: "Ordered CRM pipeline stages" })
  @ApiNotFoundResponse({ description: "CRM pipeline not found" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("pipelineCode") pipelineCode: string,
  ) {
    return this.service.listStages(workspaceId, pipelineCode);
  }

  @ApiOperation({ summary: "Get a CRM pipeline stage by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "pipelineCode" })
  @ApiParam({ name: "stageCode" })
  @ApiOkResponse({ description: "CRM pipeline stage" })
  @ApiNotFoundResponse({ description: "CRM pipeline or stage not found" })
  @Get(":stageCode")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("pipelineCode") pipelineCode: string,
    @Param("stageCode") stageCode: string,
  ) {
    return this.service.getStage(workspaceId, pipelineCode, stageCode);
  }

  @ApiOperation({ summary: "Update a CRM pipeline stage" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "pipelineCode" })
  @ApiParam({ name: "stageCode" })
  @ApiBody({ type: UpdateCrmPipelineStageDto })
  @ApiOkResponse({ description: "CRM pipeline stage updated" })
  @ApiNotFoundResponse({ description: "CRM pipeline or stage not found" })
  @Patch(":stageCode")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("pipelineCode") pipelineCode: string,
    @Param("stageCode") stageCode: string,
    @Body() data: UpdateCrmPipelineStageDto,
  ) {
    return this.service.updateStage(
      workspaceId,
      pipelineCode,
      stageCode,
      data,
    );
  }

  @ApiOperation({ summary: "Deactivate a CRM pipeline stage" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "pipelineCode" })
  @ApiParam({ name: "stageCode" })
  @ApiNoContentResponse({ description: "CRM pipeline stage deactivated" })
  @ApiNotFoundResponse({ description: "CRM pipeline or stage not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":stageCode")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("pipelineCode") pipelineCode: string,
    @Param("stageCode") stageCode: string,
  ): Promise<void> {
    await this.service.deactivateStage(
      workspaceId,
      pipelineCode,
      stageCode,
    );
  }
}
