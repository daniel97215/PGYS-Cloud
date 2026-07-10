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
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { BusinessPartnerTagsService } from "./business-partner-tags.service";
import { CreateBusinessPartnerTagDto } from "./dto/create-business-partner-tag.dto";
import { UpdateBusinessPartnerTagDto } from "./dto/update-business-partner-tag.dto";

@ApiTags("Business Partner Tags")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/business-partner-tags")
export class BusinessPartnerTagsController {
  constructor(
    private readonly businessPartnerTagsService: BusinessPartnerTagsService,
  ) {}

  @ApiOperation({ summary: "Create a business partner tag" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateBusinessPartnerTagDto })
  @ApiCreatedResponse({ description: "Business partner tag created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateBusinessPartnerTagDto,
  ) {
    return this.businessPartnerTagsService.createTag(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace business partner tags" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace business partner tags" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.businessPartnerTagsService.listWorkspaceTags(workspaceId);
  }

  @ApiOperation({ summary: "Get a business partner tag by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Business partner tag" })
  @ApiNotFoundResponse({ description: "Business partner tag not found" })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.businessPartnerTagsService.getTag(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a business partner tag" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateBusinessPartnerTagDto })
  @ApiOkResponse({ description: "Business partner tag updated" })
  @ApiNotFoundResponse({ description: "Business partner tag not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateBusinessPartnerTagDto,
  ) {
    return this.businessPartnerTagsService.updateTag(workspaceId, code, data);
  }

  @ApiOperation({ summary: "Disable a business partner tag" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Business partner tag disabled" })
  @ApiNotFoundResponse({ description: "Business partner tag not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async disable(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.businessPartnerTagsService.disableTag(workspaceId, code);
  }
}
