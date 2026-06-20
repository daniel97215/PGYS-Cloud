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
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Request } from "express";
import { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { InviteMemberDto } from "./dto/invite-member.dto";
import { UpdateMemberRoleDto } from "./dto/update-member-role.dto";
import { UpdateWorkspaceDto } from "./dto/update-workspace.dto";
import { MemberEntity } from "./entities/member.entity";
import { WorkspaceEntity } from "./entities/workspace.entity";
import { WorkspaceService } from "./workspace.service";

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags("Workspaces")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces")
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @ApiOperation({ summary: "List the current user's workspaces" })
  @ApiOkResponse({ type: WorkspaceEntity, isArray: true })
  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.workspaceService.findAll(request.user.id);
  }

  @ApiOperation({ summary: "Get a workspace" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiOkResponse({ type: WorkspaceEntity })
  @ApiForbiddenResponse({ description: "Workspace access denied" })
  @ApiNotFoundResponse({ description: "Workspace not found" })
  @Get(":id")
  findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspaceService.findOne(id, request.user.id);
  }

  @ApiOperation({ summary: "Create a workspace and its first owner" })
  @ApiCreatedResponse({ type: WorkspaceEntity })
  @ApiConflictResponse({ description: "Workspace slug conflict" })
  @Post()
  create(
    @Body() data: CreateWorkspaceDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspaceService.create(data, request.user.id);
  }

  @ApiOperation({ summary: "Update mutable workspace properties" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiOkResponse({ type: WorkspaceEntity })
  @ApiForbiddenResponse({ description: "Manager role required" })
  @ApiNotFoundResponse({ description: "Workspace not found" })
  @Patch(":id")
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() data: UpdateWorkspaceDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspaceService.update(id, data, request.user.id);
  }

  @ApiOperation({ summary: "Close a workspace" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiNoContentResponse({ description: "Workspace closed" })
  @ApiForbiddenResponse({ description: "Owner role required" })
  @ApiNotFoundResponse({ description: "Workspace not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async remove(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.workspaceService.remove(id, request.user.id);
  }

  @ApiOperation({ summary: "List workspace members" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiOkResponse({ type: MemberEntity, isArray: true })
  @ApiForbiddenResponse({ description: "Workspace access denied" })
  @Get(":id/members")
  listMembers(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspaceService.listMembers(id, request.user.id);
  }

  @ApiOperation({ summary: "Invite a workspace member" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiCreatedResponse({ type: MemberEntity })
  @ApiConflictResponse({ description: "User is already a member" })
  @ApiForbiddenResponse({ description: "Manager role required" })
  @Post(":id/members")
  inviteMember(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() data: InviteMemberDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspaceService.inviteMember(id, data, request.user.id);
  }

  @ApiOperation({ summary: "Change a workspace member role" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiParam({ name: "memberId", format: "uuid" })
  @ApiOkResponse({ type: MemberEntity })
  @ApiConflictResponse({ description: "The last owner cannot be demoted" })
  @ApiForbiddenResponse({ description: "Manager role required" })
  @Patch(":id/members/:memberId")
  updateMemberRole(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Param("memberId", new ParseUUIDPipe({ version: "4" })) memberId: string,
    @Body() data: UpdateMemberRoleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspaceService.updateMemberRole(
      id,
      memberId,
      data,
      request.user.id,
    );
  }

  @ApiOperation({ summary: "Revoke a workspace member" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiParam({ name: "memberId", format: "uuid" })
  @ApiNoContentResponse({ description: "Member revoked" })
  @ApiConflictResponse({ description: "The last owner cannot be removed" })
  @ApiForbiddenResponse({ description: "Manager role required" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id/members/:memberId")
  async removeMember(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Param("memberId", new ParseUUIDPipe({ version: "4" })) memberId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.workspaceService.removeMember(id, memberId, request.user.id);
  }
}
