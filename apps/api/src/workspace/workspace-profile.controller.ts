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
import { UpdateWorkspaceProfileDto } from "./dto/update-workspace-profile.dto";
import { WorkspaceProfileEntity } from "./entities/workspace-profile.entity";
import { WorkspaceService } from "./workspace.service";

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags("Workspace profile")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspace")
export class WorkspaceProfileController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @ApiOperation({ summary: "Get the current workspace organization profile" })
  @ApiOkResponse({ type: WorkspaceProfileEntity })
  @ApiNotFoundResponse({ description: "Workspace profile not found" })
  @Get("profile")
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.workspaceService.getProfile(request.user.id);
  }

  @ApiOperation({
    summary: "Partially update the current workspace organization profile",
  })
  @ApiOkResponse({ type: WorkspaceProfileEntity })
  @ApiBadRequestResponse({ description: "Workspace profile validation failed" })
  @ApiForbiddenResponse({ description: "Manager role required" })
  @ApiNotFoundResponse({ description: "Workspace profile not found" })
  @Put("profile")
  updateProfile(
    @Body() data: UpdateWorkspaceProfileDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspaceService.updateProfile(data, request.user.id);
  }
}
