import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateMarketingTemplateDto } from "./dto/create-marketing-template.dto";
import { UpdateMarketingTemplateDto } from "./dto/update-marketing-template.dto";
import { MarketingCampaignsService } from "./marketing-campaigns.service";

@ApiTags("Marketing Templates") @ApiBearerAuth() @ApiUnauthorizedResponse({ description: "Access token missing or invalid" }) @UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/marketing/templates")
export class MarketingTemplatesController {
  constructor(private readonly service: MarketingCampaignsService) {}
  @ApiOperation({ summary: "Create a marketing template" }) @ApiBody({ type: CreateMarketingTemplateDto }) @ApiCreatedResponse({ description: "Template created" }) @Post()
  create(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Body() data: CreateMarketingTemplateDto) { return this.service.createTemplate(workspaceId, data); }
  @ApiOperation({ summary: "List marketing templates" }) @ApiOkResponse({ description: "Templates" }) @Get()
  list(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string) { return this.service.listTemplates(workspaceId); }
  @ApiOperation({ summary: "Get a marketing template" }) @ApiParam({ name: "code" }) @Get(":code")
  get(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Param("code") code: string) { return this.service.getTemplate(workspaceId, code); }
  @ApiOperation({ summary: "Update a marketing template" }) @ApiBody({ type: UpdateMarketingTemplateDto }) @Patch(":code")
  update(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Param("code") code: string, @Body() data: UpdateMarketingTemplateDto) { return this.service.updateTemplate(workspaceId, code, data); }
  @ApiOperation({ summary: "Deactivate a marketing template" }) @ApiNoContentResponse({ description: "Template deactivated" }) @HttpCode(HttpStatus.NO_CONTENT) @Delete(":code")
  async deactivate(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Param("code") code: string): Promise<void> { await this.service.deactivateTemplate(workspaceId, code); }
}
