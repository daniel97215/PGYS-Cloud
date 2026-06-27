import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  MemberRole,
  MemberStatus,
  Prisma,
  WorkspaceStatus,
} from "@prisma/client";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { InviteMemberDto } from "./dto/invite-member.dto";
import { UpdateMemberRoleDto } from "./dto/update-member-role.dto";
import { UpdateWorkspaceSettingsDto } from "./dto/update-workspace-settings.dto";
import { UpdateWorkspaceProfileDto } from "./dto/update-workspace-profile.dto";
import { UpdateWorkspaceDto } from "./dto/update-workspace.dto";
import {
  MemberRecord,
  MembershipRecord,
  WorkspaceProfileRecord,
  WorkspaceRecord,
  WorkspaceRepository,
  WorkspaceSettingsRecord,
  WorkspaceSettingsUpdateData,
} from "./workspace.repository";
import { toSlug } from "./validators/slug.validator";

const MANAGER_ROLES = new Set<MemberRole>([
  MemberRole.OWNER,
  MemberRole.ADMIN,
]);

export interface WorkspaceSettingsView {
  id: string;
  workspaceId: string;
  general: {
    language: string;
    timezone: string;
    currency: string;
  };
  security: {
    requireMfa: boolean;
    sessionTimeoutMinutes: number;
  };
  preferences: {
    dateFormat: string;
    timeFormat: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

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

  async getProfile(userId: string): Promise<WorkspaceProfileRecord> {
    return this.requireCurrentProfile(userId);
  }

  async getSettings(userId: string): Promise<WorkspaceSettingsView> {
    const settings = await this.requireCurrentSettings(userId);
    return this.toSettingsView(settings);
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
    const updateData: Prisma.WorkspaceUpdateInput = { ...data };

    if (data.name !== undefined) {
      updateData.displayName = data.name;
    }

    return this.repository.update(id, updateData);
  }

  async updateProfile(
    data: UpdateWorkspaceProfileDto,
    userId: string,
  ): Promise<WorkspaceProfileRecord> {
    const profile = await this.requireCurrentProfile(userId);

    await this.requireManager(profile.id, userId);

    return this.repository.updateProfile(
      profile.id,
      this.toProfileUpdateInput(data),
    );
  }

  async updateSettings(
    data: UpdateWorkspaceSettingsDto,
    userId: string,
  ): Promise<WorkspaceSettingsView> {
    const current = await this.repository.findCurrentSettingsForUser(userId);

    if (!current) {
      throw new NotFoundException("Workspace settings not found");
    }

    await this.requireManager(current.id, userId);

    const settings = await this.repository.upsertSettings(
      current.id,
      this.toSettingsUpdateData(data),
    );

    return this.toSettingsView(settings);
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

  private async requireCurrentProfile(
    userId: string,
  ): Promise<WorkspaceProfileRecord> {
    const profile = await this.repository.findCurrentProfileForUser(userId);

    if (!profile) {
      throw new NotFoundException("Workspace profile not found");
    }

    return profile;
  }

  private async requireCurrentSettings(
    userId: string,
  ): Promise<WorkspaceSettingsRecord> {
    const current = await this.repository.findCurrentSettingsForUser(userId);

    if (!current) {
      throw new NotFoundException("Workspace settings not found");
    }

    if (current.settings) {
      return current.settings;
    }

    return this.repository.createDefaultSettings(current.id);
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

  private toProfileUpdateInput(
    data: UpdateWorkspaceProfileDto,
  ): Prisma.WorkspaceUpdateInput {
    const update: Prisma.WorkspaceUpdateInput = {};

    if (data.displayName !== undefined) {
      update.displayName = data.displayName;
      update.name = data.displayName;
    }

    if (data.legalName !== undefined) {
      update.legalName = data.legalName;
    }

    if (data.siret !== undefined) {
      update.siret = data.siret;
    }

    if (data.siren !== undefined) {
      update.siren = data.siren;
    }

    if (data.vatNumber !== undefined) {
      update.vatNumber = data.vatNumber;
    }

    if (data.addressLine1 !== undefined) {
      update.addressLine1 = data.addressLine1;
    }

    if (data.addressLine2 !== undefined) {
      update.addressLine2 = data.addressLine2;
    }

    if (data.postalCode !== undefined) {
      update.postalCode = data.postalCode;
    }

    if (data.city !== undefined) {
      update.city = data.city;
    }

    if (data.country !== undefined) {
      update.country = data.country;
    }

    if (data.phone !== undefined) {
      update.phone = data.phone;
    }

    if (data.website !== undefined) {
      update.website = data.website;
    }

    if (data.logoUrl !== undefined) {
      update.logoUrl = data.logoUrl;
    }

    if (data.language !== undefined) {
      update.language = data.language;
    }

    if (data.timezone !== undefined) {
      update.timezone = data.timezone;
    }

    if (data.currency !== undefined) {
      update.currency = data.currency;
    }

    if (data.activity !== undefined) {
      update.activity = data.activity;
    }

    if (data.companySize !== undefined) {
      update.companySize = data.companySize;
    }

    return update;
  }

  private toSettingsUpdateData(
    data: UpdateWorkspaceSettingsDto,
  ): WorkspaceSettingsUpdateData {
    return {
      ...(data.general?.language !== undefined
        ? { language: data.general.language }
        : {}),
      ...(data.general?.timezone !== undefined
        ? { timezone: data.general.timezone }
        : {}),
      ...(data.general?.currency !== undefined
        ? { currency: data.general.currency }
        : {}),
      ...(data.security?.requireMfa !== undefined
        ? { requireMfa: data.security.requireMfa }
        : {}),
      ...(data.security?.sessionTimeoutMinutes !== undefined
        ? { sessionTimeoutMinutes: data.security.sessionTimeoutMinutes }
        : {}),
      ...(data.preferences?.dateFormat !== undefined
        ? { dateFormat: data.preferences.dateFormat }
        : {}),
      ...(data.preferences?.timeFormat !== undefined
        ? { timeFormat: data.preferences.timeFormat }
        : {}),
    };
  }

  private toSettingsView(
    settings: WorkspaceSettingsRecord,
  ): WorkspaceSettingsView {
    return {
      id: settings.id,
      workspaceId: settings.workspaceId,
      general: {
        language: settings.language,
        timezone: settings.timezone,
        currency: settings.currency,
      },
      security: {
        requireMfa: settings.requireMfa,
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
      },
      preferences: {
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
      },
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }
}
