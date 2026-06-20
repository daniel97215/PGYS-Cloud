import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MemberRole, MemberStatus, WorkspaceStatus } from "@prisma/client";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { InviteMemberDto } from "./dto/invite-member.dto";
import { UpdateMemberRoleDto } from "./dto/update-member-role.dto";
import { UpdateWorkspaceDto } from "./dto/update-workspace.dto";
import {
  MemberRecord,
  MembershipRecord,
  WorkspaceRecord,
  WorkspaceRepository,
} from "./workspace.repository";
import { toSlug } from "./validators/slug.validator";

const MANAGER_ROLES = new Set<MemberRole>([
  MemberRole.OWNER,
  MemberRole.ADMIN,
]);

@Injectable()
export class WorkspaceService {
  constructor(private readonly repository: WorkspaceRepository) {}

  findAll(userId: string): Promise<WorkspaceRecord[]> {
    return this.repository.findManyForUser(userId);
  }

  async findOne(id: string, userId: string): Promise<WorkspaceRecord> {
    await this.requireMembership(id, userId);
    return this.requireWorkspace(id);
  }

  async create(
    data: CreateWorkspaceDto,
    creatorId: string,
  ): Promise<WorkspaceRecord> {
    const slug = await this.generateUniqueSlug(data.name);

    return this.repository.createWithOwner({
      name: data.name,
      slug,
      creatorId,
      billingEmail: data.billingEmail,
      phone: data.phone,
    });
  }

  async update(
    id: string,
    data: UpdateWorkspaceDto,
    userId: string,
  ): Promise<WorkspaceRecord> {
    await this.requireManager(id, userId);
    await this.requireWorkspace(id);
    return this.repository.update(id, data);
  }

  async remove(id: string, userId: string): Promise<void> {
    const membership = await this.requireMembership(id, userId);

    if (membership.role !== MemberRole.OWNER) {
      throw new ForbiddenException("Only an owner can close a workspace");
    }

    await this.requireWorkspace(id);
    await this.repository.close(id);
  }

  async listMembers(id: string, userId: string): Promise<MemberRecord[]> {
    await this.requireMembership(id, userId);
    await this.requireWorkspace(id);
    return this.repository.listMembers(id);
  }

  async inviteMember(
    id: string,
    data: InviteMemberDto,
    userId: string,
  ): Promise<MemberRecord> {
    const actor = await this.requireManager(id, userId);
    await this.requireWorkspace(id);
    const role = data.role ?? MemberRole.MEMBER;

    if (role === MemberRole.OWNER && actor.role !== MemberRole.OWNER) {
      throw new ForbiddenException("Only an owner can invite another owner");
    }

    const result = await this.repository.inviteMember({
      workspaceId: id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role,
    });

    if (result.alreadyMember) {
      throw new ConflictException("User is already a workspace member");
    }

    return result.member;
  }

  async updateMemberRole(
    id: string,
    memberId: string,
    data: UpdateMemberRoleDto,
    userId: string,
  ): Promise<MemberRecord> {
    const actor = await this.requireManager(id, userId);
    await this.requireWorkspace(id);
    const member = await this.requireMember(id, memberId);

    if (
      actor.role !== MemberRole.OWNER &&
      (member.role === MemberRole.OWNER || data.role === MemberRole.OWNER)
    ) {
      throw new ForbiddenException("Only an owner can manage owner roles");
    }

    if (
      member.status === MemberStatus.ACTIVE &&
      member.role === MemberRole.OWNER &&
      data.role !== MemberRole.OWNER
    ) {
      await this.ensureAnotherOwner(id);
    }

    return this.repository.updateMemberRole(member.id, data.role);
  }

  async removeMember(
    id: string,
    memberId: string,
    userId: string,
  ): Promise<void> {
    const actor = await this.requireManager(id, userId);
    await this.requireWorkspace(id);
    const member = await this.requireMember(id, memberId);

    if (actor.role !== MemberRole.OWNER && member.role === MemberRole.OWNER) {
      throw new ForbiddenException("Only an owner can remove another owner");
    }

    if (
      member.status === MemberStatus.ACTIVE &&
      member.role === MemberRole.OWNER
    ) {
      await this.ensureAnotherOwner(id);
    }

    await this.repository.revokeMember(member.id);
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = toSlug(name);
    let candidate = baseSlug;
    let suffix = 2;

    while (await this.repository.slugExists(candidate)) {
      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  private async requireWorkspace(id: string): Promise<WorkspaceRecord> {
    const workspace = await this.repository.findById(id);

    if (!workspace || workspace.status === WorkspaceStatus.CLOSED) {
      throw new NotFoundException("Workspace not found");
    }

    return workspace;
  }

  private async requireMembership(
    workspaceId: string,
    userId: string,
  ): Promise<MembershipRecord> {
    const membership = await this.repository.findActiveMembership(
      workspaceId,
      userId,
    );

    if (!membership) {
      throw new ForbiddenException("Workspace access denied");
    }

    return membership;
  }

  private async requireManager(
    workspaceId: string,
    userId: string,
  ): Promise<MembershipRecord> {
    const membership = await this.requireMembership(workspaceId, userId);

    if (!MANAGER_ROLES.has(membership.role)) {
      throw new ForbiddenException("Workspace management access denied");
    }

    return membership;
  }

  private async requireMember(
    workspaceId: string,
    memberId: string,
  ): Promise<MemberRecord> {
    const member = await this.repository.findMember(workspaceId, memberId);

    if (!member || member.status === MemberStatus.REVOKED) {
      throw new NotFoundException("Workspace member not found");
    }

    return member;
  }

  private async ensureAnotherOwner(workspaceId: string): Promise<void> {
    const ownerCount = await this.repository.countActiveOwners(workspaceId);

    if (ownerCount <= 1) {
      throw new ConflictException("Workspace must keep at least one owner");
    }
  }
}
