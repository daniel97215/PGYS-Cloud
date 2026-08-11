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
import { CreateCrmPipelineDto } from "./dto/create-crm-pipeline.dto";
import { UpdateCrmPipelineDto } from "./dto/update-crm-pipeline.dto";
import { CrmPipelinesService } from "./crm-pipelines.service";

@ApiTags("CRM Pipelines")
@Controller("workspaces/:workspaceId/crm/pipelines")
export class CrmPipelinesController {
  constructor(private readonly service: CrmPipelinesService) {}

  @ApiOperation({ summary: "Create a CRM pipeline" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateCrmPipelineDto })
  @ApiCreatedResponse({ description: "CRM pipeline created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateCrmPipelineDto,
  ) {
    return this.service.createPipeline(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace CRM pipelines" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace CRM pipelines" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.service.listPipelines(workspaceId);
  }

  @ApiOperation({ summary: "Get a CRM pipeline by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "pipelineCode" })
  @ApiOkResponse({ description: "CRM pipeline" })
  @ApiNotFoundResponse({ description: "CRM pipeline not found" })
  @Get(":pipelineCode")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("pipelineCode") pipelineCode: string,
  ) {
    return this.service.getPipeline(workspaceId, pipelineCode);
  }

  @ApiOperation({ summary: "Update a CRM pipeline" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "pipelineCode" })
  @ApiBody({ type: UpdateCrmPipelineDto })
  @ApiOkResponse({ description: "CRM pipeline updated" })
  @ApiNotFoundResponse({ description: "CRM pipeline not found" })
  @Patch(":pipelineCode")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("pipelineCode") pipelineCode: string,
    @Body() data: UpdateCrmPipelineDto,
  ) {
    return this.service.updatePipeline(workspaceId, pipelineCode, data);
  }

  @ApiOperation({ summary: "Deactivate a CRM pipeline" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "pipelineCode" })
  @ApiNoContentResponse({ description: "CRM pipeline deactivated" })
  @ApiNotFoundResponse({ description: "CRM pipeline not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":pipelineCode")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("pipelineCode") pipelineCode: string,
  ): Promise<void> {
    await this.service.deactivatePipeline(workspaceId, pipelineCode);
  }
}
