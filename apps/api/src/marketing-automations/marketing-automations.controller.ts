import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateMarketingAutomationDto } from "./dto/create-marketing-automation.dto";
import { UpdateMarketingAutomationDto } from "./dto/update-marketing-automation.dto";
import { MarketingAutomationsService } from "./marketing-automations.service";

@ApiTags("Marketing Automations") @ApiBearerAuth() @ApiUnauthorizedResponse({ description: "Access token missing or invalid" }) @UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/marketing/automations")
export class MarketingAutomationsController {
  constructor(private readonly service: MarketingAutomationsService) {}
  @ApiOperation({ summary: "Create a draft marketing automation definition" }) @ApiBody({ type: CreateMarketingAutomationDto }) @ApiCreatedResponse({ description: "Automation created" }) @Post()
  create(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Body() data: CreateMarketingAutomationDto) { return this.service.create(workspaceId, data); }
  @ApiOperation({ summary: "List marketing automation definitions" }) @ApiOkResponse({ description: "Automations" }) @Get()
  list(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string) { return this.service.list(workspaceId); }
  @ApiOperation({ summary: "Get a marketing automation definition" }) @ApiParam({ name: "code" }) @Get(":code")
  get(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Param("code") code: string) { return this.service.get(workspaceId, code); }
  @ApiOperation({ summary: "Update a draft marketing automation definition" }) @ApiBody({ type: UpdateMarketingAutomationDto }) @Patch(":code")
  update(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Param("code") code: string, @Body() data: UpdateMarketingAutomationDto) { return this.service.update(workspaceId, code, data); }
  @ApiOperation({ summary: "Activate a marketing automation definition" }) @Post(":code/activate")
  activate(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Param("code") code: string) { return this.service.activate(workspaceId, code); }
  @ApiOperation({ summary: "Deactivate a marketing automation definition" }) @Post(":code/deactivate")
  deactivate(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Param("code") code: string) { return this.service.deactivate(workspaceId, code); }
}
