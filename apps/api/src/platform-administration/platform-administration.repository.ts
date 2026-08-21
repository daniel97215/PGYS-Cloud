import { Injectable } from "@nestjs/common";
import {
  MemberStatus,
  Prisma,
  ServiceStatus,
  WorkspaceStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const platformOperatorSelect = {
  role: true,
} satisfies Prisma.PlatformOperatorSelect;

const platformWorkspaceSelect = {
  id: true,
  displayName: true,
  slug: true,
  status: true,
  billingEmail: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      members: { where: { status: MemberStatus.ACTIVE } },
      services: { where: { status: { not: ServiceStatus.TERMINATED } } },
    },
  },
} satisfies Prisma.WorkspaceSelect;

export type PlatformOperatorRecord = Prisma.PlatformOperatorGetPayload<{
  select: typeof platformOperatorSelect;
}>;

export type PlatformWorkspaceRecord = Prisma.WorkspaceGetPayload<{
  select: typeof platformWorkspaceSelect;
}>;

export interface PlatformWorkspaceCriteria {
  search?: string;
  status?: WorkspaceStatus;
  page?: number;
  pageSize?: number;
}

export interface PlatformWorkspacePage {
  items: PlatformWorkspaceRecord[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class PlatformAdministrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveOperator(userId: string): Promise<PlatformOperatorRecord | null> {
    return this.prisma.platformOperator.findFirst({
      where: { userId, active: true },
      select: platformOperatorSelect,
    });
  }

  async searchWorkspaces(
    criteria: PlatformWorkspaceCriteria,
  ): Promise<PlatformWorkspacePage> {
    const page = Math.max(criteria.page ?? 1, 1);
    const pageSize = Math.min(Math.max(criteria.pageSize ?? 25, 1), 100);
    const where = this.workspaceWhere(criteria);
    const [items, total] = await Promise.all([
      this.prisma.workspace.findMany({
        where,
        select: platformWorkspaceSelect,
        orderBy: [{ createdAt: "desc" }, { displayName: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.workspace.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  findWorkspaceById(id: string): Promise<PlatformWorkspaceRecord | null> {
    return this.prisma.workspace.findUnique({
      where: { id },
      select: platformWorkspaceSelect,
    });
  }

  private workspaceWhere(
    criteria: PlatformWorkspaceCriteria,
  ): Prisma.WorkspaceWhereInput {
    const search = criteria.search?.trim();

    return {
      ...(criteria.status ? { status: criteria.status } : {}),
      ...(search
        ? {
            OR: [
              { displayName: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }
}
