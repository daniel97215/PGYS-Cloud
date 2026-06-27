import { ConflictException } from "@nestjs/common";
import {
  MemberRole,
  MemberStatus,
  UserStatus,
  WorkspaceStatus,
} from "@prisma/client";
import {
  MemberRecord,
  WorkspaceProfileRecord,
  WorkspaceRecord,
  WorkspaceRepository,
  WorkspaceSettingsRecord,
} from "../workspace.repository";
import { WorkspaceService } from "../workspace.service";

describe("WorkspaceService", () => {
  let repository: jest.Mocked<WorkspaceRepository>;
  let service: WorkspaceService;

  const workspace: WorkspaceRecord = {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Garage Martin",
    displayName: "Garage Martin",
    legalName: null,
    siret: null,
    siren: null,
    vatNumber: null,
    addressLine1: null,
    addressLine2: null,
    postalCode: null,
    city: null,
    country: null,
    slug: "garage-martin",
    status: WorkspaceStatus.ACTIVE,
    billingEmail: null,
    phone: null,
    website: null,
    logoUrl: null,
    locale: "fr-FR",
    language: null,
    timezone: "Europe/Paris",
    currency: null,
    activity: null,
    companySize: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    closedAt: null,
  };
  const profile: WorkspaceProfileRecord = {
    id: workspace.id,
    displayName: workspace.displayName,
    legalName: workspace.legalName,
    siret: workspace.siret,
    siren: workspace.siren,
    vatNumber: workspace.vatNumber,
    addressLine1: workspace.addressLine1,
    addressLine2: workspace.addressLine2,
    postalCode: workspace.postalCode,
    city: workspace.city,
    country: workspace.country,
    phone: workspace.phone,
    website: workspace.website,
    logoUrl: workspace.logoUrl,
    language: workspace.language,
    timezone: workspace.timezone,
    currency: workspace.currency,
    activity: workspace.activity,
    companySize: workspace.companySize,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
  const settings: WorkspaceSettingsRecord = {
    id: "60000000-0000-4000-8000-000000000001",
    workspaceId: workspace.id,
    language: "fr",
    timezone: "Europe/Paris",
    currency: "EUR",
    requireMfa: false,
    sessionTimeoutMinutes: 480,
    dateFormat: "dd/MM/yyyy",
    timeFormat: "HH:mm",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  const ownerId = "20000000-0000-4000-8000-000000000001";
  const memberId = "30000000-0000-4000-8000-000000000001";

  beforeEach(() => {
    repository = {
      findManyForUser: jest.fn(),
      findById: jest.fn().mockResolvedValue(workspace),
      findCurrentProfileForUser: jest.fn().mockResolvedValue(profile),
      findCurrentSettingsForUser: jest.fn().mockResolvedValue({
        id: workspace.id,
        settings,
      }),
      findActiveMembership: jest.fn().mockResolvedValue({
        id: "40000000-0000-4000-8000-000000000001",
        workspaceId: workspace.id,
        userId: ownerId,
        role: MemberRole.OWNER,
        status: MemberStatus.ACTIVE,
      }),
      slugExists: jest.fn().mockResolvedValue(false),
      createWithOwner: jest.fn().mockResolvedValue(workspace),
      update: jest.fn(),
      updateProfile: jest.fn(),
      createDefaultSettings: jest.fn().mockResolvedValue(settings),
      upsertSettings: jest.fn(),
      close: jest.fn(),
      listMembers: jest.fn(),
      findMember: jest.fn(),
      inviteMember: jest.fn(),
      updateMemberRole: jest.fn(),
      revokeMember: jest.fn(),
      countActiveOwners: jest.fn(),
    } as unknown as jest.Mocked<WorkspaceRepository>;
    service = new WorkspaceService(repository);
  });

  it("generates a unique slug with an incrementing suffix", async () => {
    repository.slugExists
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await service.create({ name: "Garage Martin" }, ownerId);

    expect(repository.createWithOwner).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "garage-martin-3" }),
    );
  });

  it("adds a member through the repository", async () => {
    const invitedMember = createMember(MemberRole.MEMBER, MemberStatus.INVITED);
    repository.inviteMember.mockResolvedValue({
      member: invitedMember,
      alreadyMember: false,
    });

    const result = await service.inviteMember(
      workspace.id,
      {
        email: invitedMember.user.email,
        firstName: invitedMember.user.firstName,
        lastName: invitedMember.user.lastName,
      },
      ownerId,
    );

    expect(result).toEqual(invitedMember);
    expect(repository.inviteMember).toHaveBeenCalledWith(
      expect.objectContaining({ role: MemberRole.MEMBER }),
    );
  });

  it("retrieves the current workspace profile", async () => {
    const result = await service.getProfile(ownerId);

    expect(result).toEqual(profile);
    expect(repository.findCurrentProfileForUser).toHaveBeenCalledWith(ownerId);
  });

  it("partially updates the current workspace profile", async () => {
    const updatedProfile = {
      ...profile,
      displayName: "Garage Martin Pro",
      website: "https://garage-martin.fr",
    };
    repository.updateProfile.mockResolvedValue(updatedProfile);

    const result = await service.updateProfile(
      {
        displayName: updatedProfile.displayName,
        website: updatedProfile.website,
      },
      ownerId,
    );

    expect(result).toEqual(updatedProfile);
    expect(repository.updateProfile).toHaveBeenCalledWith(
      workspace.id,
      expect.objectContaining({
        displayName: updatedProfile.displayName,
        name: updatedProfile.displayName,
        website: updatedProfile.website,
      }),
    );
  });

  it("retrieves the current workspace settings", async () => {
    const result = await service.getSettings(ownerId);

    expect(result).toEqual({
      id: settings.id,
      workspaceId: workspace.id,
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
    });
    expect(repository.findCurrentSettingsForUser).toHaveBeenCalledWith(ownerId);
  });

  it("creates default settings when the current workspace has none", async () => {
    repository.findCurrentSettingsForUser.mockResolvedValueOnce({
      id: workspace.id,
      settings: null,
    });

    await service.getSettings(ownerId);

    expect(repository.createDefaultSettings).toHaveBeenCalledWith(workspace.id);
  });

  it("partially updates the current workspace settings", async () => {
    const updatedSettings = {
      ...settings,
      language: "en",
      requireMfa: true,
      timeFormat: "hh:mm a",
    };
    repository.upsertSettings.mockResolvedValue(updatedSettings);

    const result = await service.updateSettings(
      {
        general: { language: "en" },
        security: { requireMfa: true },
        preferences: { timeFormat: "hh:mm a" },
      },
      ownerId,
    );

    expect(result.general.language).toBe("en");
    expect(result.security.requireMfa).toBe(true);
    expect(result.preferences.timeFormat).toBe("hh:mm a");
    expect(repository.upsertSettings).toHaveBeenCalledWith(
      workspace.id,
      expect.objectContaining({
        language: "en",
        requireMfa: true,
        timeFormat: "hh:mm a",
      }),
    );
  });

  it("changes a member role", async () => {
    const member = createMember(MemberRole.MEMBER, MemberStatus.ACTIVE);
    const updated = { ...member, role: MemberRole.ADMIN };
    repository.findMember.mockResolvedValue(member);
    repository.updateMemberRole.mockResolvedValue(updated);

    const result = await service.updateMemberRole(
      workspace.id,
      member.id,
      { role: MemberRole.ADMIN },
      ownerId,
    );

    expect(result.role).toBe(MemberRole.ADMIN);
    expect(repository.updateMemberRole).toHaveBeenCalledWith(
      member.id,
      MemberRole.ADMIN,
    );
  });

  it("revokes a member", async () => {
    const member = createMember(MemberRole.MEMBER, MemberStatus.ACTIVE);
    repository.findMember.mockResolvedValue(member);
    repository.revokeMember.mockResolvedValue({
      ...member,
      status: MemberStatus.REVOKED,
      revokedAt: new Date(),
    });

    await service.removeMember(workspace.id, member.id, ownerId);

    expect(repository.revokeMember).toHaveBeenCalledWith(member.id);
  });

  it("refuses to remove the last active owner", async () => {
    const owner = createMember(MemberRole.OWNER, MemberStatus.ACTIVE);
    repository.findMember.mockResolvedValue(owner);
    repository.countActiveOwners.mockResolvedValue(1);

    await expect(
      service.removeMember(workspace.id, owner.id, ownerId),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.revokeMember).not.toHaveBeenCalled();
  });

  it("refuses to demote the last active owner", async () => {
    const owner = createMember(MemberRole.OWNER, MemberStatus.ACTIVE);
    repository.findMember.mockResolvedValue(owner);
    repository.countActiveOwners.mockResolvedValue(1);

    await expect(
      service.updateMemberRole(
        workspace.id,
        owner.id,
        { role: MemberRole.ADMIN },
        ownerId,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.updateMemberRole).not.toHaveBeenCalled();
  });

  function createMember(
    role: MemberRole,
    status: MemberStatus,
  ): MemberRecord {
    return {
      id: memberId,
      workspaceId: workspace.id,
      userId: "50000000-0000-4000-8000-000000000001",
      role,
      status,
      invitedAt: new Date("2026-01-01T00:00:00.000Z"),
      joinedAt:
        status === MemberStatus.ACTIVE
          ? new Date("2026-01-01T00:00:00.000Z")
          : null,
      revokedAt: null,
      user: {
        id: "50000000-0000-4000-8000-000000000001",
        email: "marie@example.fr",
        firstName: "Marie",
        lastName: "Martin",
        status: UserStatus.ACTIVE,
      },
    };
  }
});
