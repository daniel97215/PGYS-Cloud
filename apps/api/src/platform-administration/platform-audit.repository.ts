import { Injectable } from "@nestjs/common";
import { AuditAction, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const platformAuditSelect = {
  id: true,
  action: true,
  targetType: true,
  targetId: true,
  metadata: true,
  createdAt: true,
  workspace: {
    select: { id: true, displayName: true, slug: true },
  },
  actor: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
} satisfies Prisma.AuditLogSelect;

export type PlatformAuditRecord = Prisma.AuditLogGetPayload<{
  select: typeof platformAuditSelect;
}>;

export interface PlatformAuditCriteria {
  search?: string;
  action?: AuditAction;
  workspaceId?: string;
  actorId?: string;
  targetType?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
}

export interface PlatformAuditPage {
  items: PlatformAuditRecord[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class PlatformAuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(criteria: PlatformAuditCriteria): Promise<PlatformAuditPage> {
    const page = Math.max(criteria.page ?? 1, 1);
    const pageSize = Math.min(Math.max(criteria.pageSize ?? 25, 1), 100);
    const where = this.where(criteria);
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        select: platformAuditSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  findById(id: string): Promise<PlatformAuditRecord | null> {
    return this.prisma.auditLog.findUnique({
      where: { id },
      select: platformAuditSelect,
    });
  }

  private where(criteria: PlatformAuditCriteria): Prisma.AuditLogWhereInput {
    const search = criteria.search?.trim();

    return {
      ...(criteria.action ? { action: criteria.action } : {}),
      ...(criteria.workspaceId ? { workspaceId: criteria.workspaceId } : {}),
      ...(criteria.actorId ? { actorId: criteria.actorId } : {}),
      ...(criteria.targetType ? { targetType: criteria.targetType } : {}),
      ...(criteria.from || criteria.to
        ? {
            createdAt: {
              ...(criteria.from ? { gte: criteria.from } : {}),
              ...(criteria.to ? { lte: criteria.to } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                workspace: {
                  displayName: { contains: search, mode: "insensitive" },
                },
              },
              {
                workspace: {
                  slug: { contains: search, mode: "insensitive" },
                },
              },
              { targetType: { contains: search, mode: "insensitive" } },
              { targetId: { contains: search, mode: "insensitive" } },
              {
                actor: { email: { contains: search, mode: "insensitive" } },
              },
              {
                actor: {
                  firstName: { contains: search, mode: "insensitive" },
                },
              },
              {
                actor: {
                  lastName: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    };
  }
}
