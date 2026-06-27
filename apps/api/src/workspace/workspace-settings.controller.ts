import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Request } from "express";
import { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdateWorkspaceSettingsDto } from "./dto/update-workspace-settings.dto";
import { WorkspaceSettingsEntity } from "./entities/workspace-settings.entity";
import { WorkspaceService } from "./workspace.service";

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags("Workspace settings")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspace")
export class WorkspaceSettingsController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @ApiOperation({ summary: "Get the current workspace settings" })
  @ApiOkResponse({ type: WorkspaceSettingsEntity })
  @ApiNotFoundResponse({ description: "Workspace settings not found" })
  @Get("settings")
  getSettings(@Req() request: AuthenticatedRequest) {
    return this.workspaceService.getSettings(request.user.id);
  }

  @ApiOperation({ summary: "Partially update the current workspace settings" })
  @ApiOkResponse({ type: WorkspaceSettingsEntity })
  @ApiBadRequestResponse({ description: "Workspace settings validation failed" })
  @ApiForbiddenResponse({ description: "Manager role required" })
  @ApiNotFoundResponse({ description: "Workspace settings not found" })
  @Put("settings")
  updateSettings(
    @Body() data: UpdateWorkspaceSettingsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspaceService.updateSettings(data, request.user.id);
  }
}
