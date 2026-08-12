import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateMarketingCampaignDto } from "./dto/create-marketing-campaign.dto";
import { UpdateMarketingCampaignDto } from "./dto/update-marketing-campaign.dto";
import { MarketingCampaignsService } from "./marketing-campaigns.service";

@ApiTags("Marketing Campaigns") @ApiBearerAuth() @ApiUnauthorizedResponse({ description: "Access token missing or invalid" }) @UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/marketing/campaigns")
export class MarketingCampaignsController {
  constructor(private readonly service: MarketingCampaignsService) {}
  @ApiOperation({ summary: "Create a draft marketing campaign" }) @ApiBody({ type: CreateMarketingCampaignDto }) @ApiCreatedResponse({ description: "Campaign created" }) @Post()
  create(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Body() data: CreateMarketingCampaignDto) { return this.service.createCampaign(workspaceId, data); }
  @ApiOperation({ summary: "List marketing campaigns" }) @ApiOkResponse({ description: "Campaigns" }) @Get()
  list(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string) { return this.service.listCampaigns(workspaceId); }
  @ApiOperation({ summary: "Get a marketing campaign" }) @ApiParam({ name: "code" }) @Get(":code")
  get(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Param("code") code: string) { return this.service.getCampaign(workspaceId, code); }
  @ApiOperation({ summary: "Update a draft marketing campaign" }) @ApiBody({ type: UpdateMarketingCampaignDto }) @Patch(":code")
  update(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Param("code") code: string, @Body() data: UpdateMarketingCampaignDto) { return this.service.updateCampaign(workspaceId, code, data); }
  @ApiOperation({ summary: "Mark a draft campaign ready" }) @Post(":code/ready")
  ready(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Param("code") code: string) { return this.service.markReady(workspaceId, code); }
  @ApiOperation({ summary: "Cancel a draft or ready campaign" }) @Post(":code/cancel")
  cancel(@Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string, @Param("code") code: string) { return this.service.cancel(workspaceId, code); }
}
