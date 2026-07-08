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
import { BusinessPartnerRolesService } from "./business-partner-roles.service";
import { CreateBusinessPartnerRoleDto } from "./dto/create-business-partner-role.dto";
import { UpdateBusinessPartnerRoleDto } from "./dto/update-business-partner-role.dto";

@ApiTags("Business Partner Roles")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/business-partner-roles")
export class BusinessPartnerRolesController {
  constructor(
    private readonly businessPartnerRolesService: BusinessPartnerRolesService,
  ) {}

  @ApiOperation({ summary: "Create a business partner role" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateBusinessPartnerRoleDto })
  @ApiCreatedResponse({ description: "Business partner role created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateBusinessPartnerRoleDto,
  ) {
    return this.businessPartnerRolesService.createRole(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace business partner roles" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace business partner roles" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.businessPartnerRolesService.listWorkspaceRoles(workspaceId);
  }

  @ApiOperation({ summary: "Get a business partner role by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Business partner role" })
  @ApiNotFoundResponse({ description: "Business partner role not found" })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.businessPartnerRolesService.getRole(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a business partner role" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateBusinessPartnerRoleDto })
  @ApiOkResponse({ description: "Business partner role updated" })
  @ApiNotFoundResponse({ description: "Business partner role not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateBusinessPartnerRoleDto,
  ) {
    return this.businessPartnerRolesService.updateRole(
      workspaceId,
      code,
      data,
    );
  }

  @ApiOperation({ summary: "Disable a business partner role" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Business partner role disabled" })
  @ApiNotFoundResponse({ description: "Business partner role not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async disable(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.businessPartnerRolesService.disableRole(workspaceId, code);
  }
}
