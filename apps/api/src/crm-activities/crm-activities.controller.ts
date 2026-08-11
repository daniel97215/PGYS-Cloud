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
import { CreateCrmActivityDto } from "./dto/create-crm-activity.dto";
import { UpdateCrmActivityDto } from "./dto/update-crm-activity.dto";
import { CrmActivitiesService } from "./crm-activities.service";

@ApiTags("CRM Activities")
@Controller("workspaces/:workspaceId/crm/activities")
export class CrmActivitiesController {
  constructor(private readonly service: CrmActivitiesService) {}

  @ApiOperation({ summary: "Create a planned CRM activity" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateCrmActivityDto })
  @ApiCreatedResponse({ description: "CRM activity created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Body() data: CreateCrmActivityDto,
  ) {
    return this.service.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace CRM activities" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace CRM activities" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
  ) {
    return this.service.list(workspaceId);
  }

  @ApiOperation({ summary: "Get a CRM activity" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "activityId", format: "uuid" })
  @ApiOkResponse({ description: "CRM activity" })
  @ApiNotFoundResponse({ description: "CRM activity not found" })
  @Get(":activityId")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("activityId", new ParseUUIDPipe({ version: "4" })) activityId: string,
  ) {
    return this.service.get(workspaceId, activityId);
  }

  @ApiOperation({ summary: "Update a planned CRM activity" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "activityId", format: "uuid" })
  @ApiBody({ type: UpdateCrmActivityDto })
  @ApiOkResponse({ description: "CRM activity updated" })
  @Patch(":activityId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("activityId", new ParseUUIDPipe({ version: "4" })) activityId: string,
    @Body() data: UpdateCrmActivityDto,
  ) {
    return this.service.update(workspaceId, activityId, data);
  }

  @ApiOperation({ summary: "Complete a planned CRM activity" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "activityId", format: "uuid" })
  @ApiOkResponse({ description: "CRM activity completed" })
  @Post(":activityId/complete")
  complete(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("activityId", new ParseUUIDPipe({ version: "4" })) activityId: string,
  ) {
    return this.service.complete(workspaceId, activityId);
  }

  @ApiOperation({ summary: "Cancel a planned CRM activity" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "activityId", format: "uuid" })
  @ApiOkResponse({ description: "CRM activity cancelled" })
  @Post(":activityId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("activityId", new ParseUUIDPipe({ version: "4" })) activityId: string,
  ) {
    return this.service.cancel(workspaceId, activityId);
  }
}
