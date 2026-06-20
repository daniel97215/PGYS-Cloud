import { Injectable } from "@nestjs/common";
import {
  MemberRole,
  MemberStatus,
  Prisma,
  UserStatus,
  WorkspaceStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const workspaceSelect = {
  id: true,
  name: true,
  slug: true,
  status: true,
  billingEmail: true,
  phone: true,
  locale: true,
  timezone: true,
  createdAt: true,
  updatedAt: true,
  closedAt: true,
} satisfies Prisma.WorkspaceSelect;

const memberSelect = {
  id: true,
  workspaceId: true,
  userId: true,
  role: true,
  status: true,
  invitedAt: true,
  joinedAt: true,
  revokedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
    },
  },
} satisfies Prisma.MemberSelect;

export type WorkspaceRecord = Prisma.WorkspaceGetPayload<{
  select: typeof workspaceSelect;
}>;
export type MemberRecord = Prisma.MemberGetPayload<{
  select: typeof memberSelect;
}>;
export type MembershipRecord = Pick<
  MemberRecord,
  "id" | "workspaceId" | "userId" | "role" | "status"
>;

export interface CreateWorkspaceRecord {
  name: string;
  slug: string;
  creatorId: string;
  billingEmail?: string;
  phone?: string;
}

export interface InviteMemberRecord {
  workspaceId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: MemberRole;
}

export interface InviteMemberResult {
  member: MemberRecord;
  alreadyMember: boolean;
}

@Injectable()
export class WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyForUser(userId: string): Promise<WorkspaceRecord[]> {
    return this.prisma.workspace.findMany({
      where: {
        status: { not: WorkspaceStatus.CLOSED },
        members: {
          some: { userId, status: MemberStatus.ACTIVE },
        },
      },
      orderBy: { createdAt: "desc" },
      select: workspaceSelect,
    });
  }

  findById(id: string): Promise<WorkspaceRecord | null> {
    return this.prisma.workspace.findUnique({
      where: { id },
      select: workspaceSelect,
    });
  }

  findActiveMembership(
    workspaceId: string,
    userId: string,
  ): Promise<MembershipRecord | null> {
    return this.prisma.member.findFirst({
      where: { workspaceId, userId, status: MemberStatus.ACTIVE },
      select: {
        id: true,
        workspaceId: true,
        userId: true,
        role: true,
        status: true,
      },
    });
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await this.prisma.workspace.count({ where: { slug } });
    return count > 0;
  }

  createWithOwner(data: CreateWorkspaceRecord): Promise<WorkspaceRecord> {
    return this.prisma.$transaction(async (transaction) => {
      const workspace = await transaction.workspace.create({
        data: {
          name: data.name,
          slug: data.slug,
          status: WorkspaceStatus.ACTIVE,
          billingEmail: data.billingEmail,
          phone: data.phone,
        },
        select: workspaceSelect,
      });

      await transaction.member.create({
        data: {
          workspaceId: workspace.id,
          userId: data.creatorId,
          role: MemberRole.OWNER,
          status: MemberStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });

      return workspace;
    });
  }

  update(
    id: string,
    data: Prisma.WorkspaceUpdateInput,
  ): Promise<WorkspaceRecord> {
    return this.prisma.workspace.update({
      where: { id },
      data,
      select: workspaceSelect,
    });
  }

  close(id: string): Promise<WorkspaceRecord> {
    return this.prisma.workspace.update({
      where: { id },
      data: { status: WorkspaceStatus.CLOSED, closedAt: new Date() },
      select: workspaceSelect,
    });
  }

  listMembers(workspaceId: string): Promise<MemberRecord[]> {
    return this.prisma.member.findMany({
      where: { workspaceId, status: { not: MemberStatus.REVOKED } },
      orderBy: { createdAt: "asc" },
      select: memberSelect,
    });
  }

  findMember(
    workspaceId: string,
    memberId: string,
  ): Promise<MemberRecord | null> {
    return this.prisma.member.findFirst({
      where: { id: memberId, workspaceId },
      select: memberSelect,
    });
  }

  inviteMember(data: InviteMemberRecord): Promise<InviteMemberResult> {
    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.upsert({
        where: { email: data.email },
        update: {},
        create: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          status: UserStatus.INVITED,
        },
        select: { id: true },
      });
      const existing = await transaction.member.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: data.workspaceId,
            userId: user.id,
          },
        },
        select: memberSelect,
      });

      if (existing && existing.status !== MemberStatus.REVOKED) {
        return { member: existing, alreadyMember: true };
      }

      const member = existing
        ? await transaction.member.update({
            where: { id: existing.id },
            data: {
              role: data.role,
              status: MemberStatus.INVITED,
              invitedAt: new Date(),
              joinedAt: null,
              revokedAt: null,
            },
            select: memberSelect,
          })
        : await transaction.member.create({
            data: {
              workspaceId: data.workspaceId,
              userId: user.id,
              role: data.role,
              status: MemberStatus.INVITED,
            },
            select: memberSelect,
          });

      return { member, alreadyMember: false };
    });
  }

  updateMemberRole(memberId: string, role: MemberRole): Promise<MemberRecord> {
    return this.prisma.member.update({
      where: { id: memberId },
      data: { role },
      select: memberSelect,
    });
  }

  revokeMember(memberId: string): Promise<MemberRecord> {
    return this.prisma.member.update({
      where: { id: memberId },
      data: {
        status: MemberStatus.REVOKED,
        revokedAt: new Date(),
      },
      select: memberSelect,
    });
  }

  countActiveOwners(workspaceId: string): Promise<number> {
    return this.prisma.member.count({
      where: {
        workspaceId,
        role: MemberRole.OWNER,
        status: MemberStatus.ACTIVE,
      },
    });
  }
}
