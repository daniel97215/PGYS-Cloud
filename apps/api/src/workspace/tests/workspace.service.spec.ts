import { ConflictException } from "@nestjs/common";
import {
  MemberRole,
  MemberStatus,
  UserStatus,
  WorkspaceStatus,
} from "@prisma/client";
import {
  MemberRecord,
  WorkspaceRecord,
  WorkspaceRepository,
} from "../workspace.repository";
import { WorkspaceService } from "../workspace.service";

describe("WorkspaceService", () => {
  let repository: jest.Mocked<WorkspaceRepository>;
  let service: WorkspaceService;

  const workspace: WorkspaceRecord = {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Garage Martin",
    slug: "garage-martin",
    status: WorkspaceStatus.ACTIVE,
    billingEmail: null,
    phone: null,
    locale: "fr-FR",
    timezone: "Europe/Paris",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    closedAt: null,
  };
  const ownerId = "20000000-0000-4000-8000-000000000001";
  const memberId = "30000000-0000-4000-8000-000000000001";

  beforeEach(() => {
    repository = {
      findManyForUser: jest.fn(),
      findById: jest.fn().mockResolvedValue(workspace),
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
