import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CreateCrmOpportunityDto } from "./dto/create-crm-opportunity.dto";
import { MoveCrmOpportunityDto } from "./dto/move-crm-opportunity.dto";
import { UpdateCrmOpportunityDto } from "./dto/update-crm-opportunity.dto";
import { CrmOpportunitiesService } from "./crm-opportunities.service";

@ApiTags("CRM Opportunities")
@Controller("workspaces/:workspaceId/crm/opportunities")
export class CrmOpportunitiesController {
  constructor(private readonly service: CrmOpportunitiesService) {}

  @ApiOperation({ summary: "Create a CRM opportunity" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateCrmOpportunityDto })
  @ApiCreatedResponse({ description: "CRM opportunity created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Body() data: CreateCrmOpportunityDto,
  ) {
    return this.service.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace CRM opportunities" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace CRM opportunities" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
  ) {
    return this.service.list(workspaceId);
  }

  @ApiOperation({ summary: "Get a CRM opportunity" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "opportunityId", format: "uuid" })
  @ApiOkResponse({ description: "CRM opportunity" })
  @ApiNotFoundResponse({ description: "CRM opportunity not found" })
  @Get(":opportunityId")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("opportunityId", new ParseUUIDPipe({ version: "4" })) opportunityId: string,
  ) {
    return this.service.get(workspaceId, opportunityId);
  }

  @ApiOperation({ summary: "Update an open CRM opportunity" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "opportunityId", format: "uuid" })
  @ApiBody({ type: UpdateCrmOpportunityDto })
  @ApiOkResponse({ description: "CRM opportunity updated" })
  @Patch(":opportunityId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("opportunityId", new ParseUUIDPipe({ version: "4" })) opportunityId: string,
    @Body() data: UpdateCrmOpportunityDto,
  ) {
    return this.service.update(workspaceId, opportunityId, data);
  }

  @ApiOperation({ summary: "Move an open CRM opportunity to another stage" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "opportunityId", format: "uuid" })
  @ApiBody({ type: MoveCrmOpportunityDto })
  @ApiOkResponse({ description: "CRM opportunity stage updated" })
  @Patch(":opportunityId/stage")
  moveStage(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("opportunityId", new ParseUUIDPipe({ version: "4" })) opportunityId: string,
    @Body() data: MoveCrmOpportunityDto,
  ) {
    return this.service.moveStage(workspaceId, opportunityId, data);
  }
}
