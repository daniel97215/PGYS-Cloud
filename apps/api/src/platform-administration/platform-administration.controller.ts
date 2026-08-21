import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { PlatformOperatorRole } from "@prisma/client";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PlatformWorkspacePageResponseDto, PlatformWorkspaceResponseDto } from "./dto/platform-workspace-response.dto";
import { SearchPlatformWorkspacesDto } from "./dto/search-platform-workspaces.dto";
import { PlatformAdministrationService } from "./platform-administration.service";
import { PlatformRoles } from "./platform-roles.decorator";
import { PlatformRolesGuard } from "./platform-roles.guard";

interface PlatformAuthenticatedRequest extends Request {
  platformOperator: { role: PlatformOperatorRole };
}

@ApiTags("Platform Administration")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@ApiForbiddenResponse({ description: "Platform operator access required" })
@UseGuards(JwtAuthGuard, PlatformRolesGuard)
@PlatformRoles(
  PlatformOperatorRole.PLATFORM_ADMIN,
  PlatformOperatorRole.PLATFORM_SUPPORT,
)
@Controller("platform/workspaces")
export class PlatformAdministrationController {
  constructor(private readonly service: PlatformAdministrationService) {}

  @ApiOperation({ summary: "List workspaces for a platform operator" })
  @ApiOkResponse({ type: PlatformWorkspacePageResponseDto })
  @Get()
  search(
    @Query() criteria: SearchPlatformWorkspacesDto,
    @Req() request: PlatformAuthenticatedRequest,
  ) {
    return this.service.searchWorkspaces(
      criteria,
      request.platformOperator.role,
    );
  }

  @ApiOperation({ summary: "Get a workspace for a platform operator" })
  @ApiOkResponse({ type: PlatformWorkspaceResponseDto })
  @ApiNotFoundResponse({ description: "Workspace not found" })
  @Get(":id")
  getOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.service.getWorkspace(id);
  }
}
