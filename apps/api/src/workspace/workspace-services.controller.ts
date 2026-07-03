import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { IsObject, IsOptional } from "class-validator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WorkspaceServicesService } from "./workspace-services.service";

class ActivateWorkspaceServiceDto {
  @ApiPropertyOptional({
    example: { defaultCurrency: "EUR" },
    additionalProperties: true,
    type: "object",
  })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, unknown>;
}

class UpdateWorkspaceServiceConfigurationDto {
  @ApiProperty({
    example: { defaultCurrency: "EUR" },
    additionalProperties: true,
    type: "object",
  })
  @IsObject()
  configuration!: Record<string, unknown>;
}

@ApiTags("Workspace services")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/services")
export class WorkspaceServicesController {
  constructor(
    private readonly workspaceServicesService: WorkspaceServicesService,
  ) {}

  @ApiOperation({ summary: "List workspace services" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace services" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.workspaceServicesService.listWorkspaceServices(workspaceId);
  }

  @ApiOperation({ summary: "Activate a workspace service" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "serviceKey" })
  @ApiBody({ type: ActivateWorkspaceServiceDto, required: false })
  @ApiCreatedResponse({ description: "Workspace service activated" })
  @Post(":serviceKey")
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("serviceKey") serviceKey: string,
    @Body() data?: ActivateWorkspaceServiceDto,
  ) {
    return this.workspaceServicesService.enableService(
      workspaceId,
      serviceKey,
      data?.configuration,
    );
  }

  @ApiOperation({ summary: "Disable a workspace service" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "serviceKey" })
  @ApiNoContentResponse({ description: "Workspace service disabled" })
  @ApiNotFoundResponse({ description: "Workspace service not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":serviceKey")
  async remove(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("serviceKey") serviceKey: string,
  ): Promise<void> {
    await this.workspaceServicesService.disableService(workspaceId, serviceKey);
  }

  @ApiOperation({ summary: "Get workspace service configuration" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "serviceKey" })
  @ApiOkResponse({ description: "Workspace service configuration" })
  @ApiNotFoundResponse({ description: "Workspace service not found" })
  @Get(":serviceKey/configuration")
  getConfiguration(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("serviceKey") serviceKey: string,
  ) {
    return this.workspaceServicesService.getConfiguration(
      workspaceId,
      serviceKey,
    );
  }

  @ApiOperation({ summary: "Update workspace service configuration" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "serviceKey" })
  @ApiBody({ type: UpdateWorkspaceServiceConfigurationDto })
  @ApiOkResponse({ description: "Workspace service configuration updated" })
  @ApiNotFoundResponse({ description: "Workspace service not found" })
  @Put(":serviceKey/configuration")
  updateConfiguration(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("serviceKey") serviceKey: string,
    @Body() data: UpdateWorkspaceServiceConfigurationDto,
  ) {
    return this.workspaceServicesService.updateConfiguration(
      workspaceId,
      serviceKey,
      data.configuration,
    );
  }
}
