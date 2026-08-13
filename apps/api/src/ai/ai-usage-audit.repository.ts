import { Injectable } from "@nestjs/common";
import { AiUsageStatus, MemberStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AiProviderId } from "./ai.constants";

export type AiUsageAuditRecord = Prisma.AiUsageAuditGetPayload<object>;

export interface CreateAiUsageAuditData {
  workspaceId: string;
  actorId?: string;
  sourceModule: string;
  useCase: string;
  provider: AiProviderId;
  model: string;
  status: AiUsageStatus;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface AiUsageAuditSearchCriteria {
  status?: AiUsageStatus;
  provider?: AiProviderId;
  useCase?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
}

export interface AiUsageAuditSearchResult {
  items: AiUsageAuditRecord[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class AiUsageAuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAiUsageAuditData): Promise<AiUsageAuditRecord> {
    return this.prisma.aiUsageAudit.create({ data });
  }

  async workspaceExists(workspaceId: string): Promise<boolean> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true },
    });
    return workspace !== null;
  }

  async isActiveWorkspaceMember(
    workspaceId: string,
    userId: string,
  ): Promise<boolean> {
    const member = await this.prisma.member.findFirst({
      where: { workspaceId, userId, status: MemberStatus.ACTIVE },
      select: { id: true },
    });
    return member !== null;
  }

  async search(
    workspaceId: string,
    criteria: AiUsageAuditSearchCriteria,
  ): Promise<AiUsageAuditSearchResult> {
    const page = Math.max(criteria.page ?? 1, 1);
    const pageSize = Math.min(Math.max(criteria.pageSize ?? 25, 1), 100);
    const where: Prisma.AiUsageAuditWhereInput = {
      workspaceId,
      ...(criteria.status === undefined ? {} : { status: criteria.status }),
      ...(criteria.provider === undefined
        ? {}
        : { provider: criteria.provider }),
      ...(criteria.useCase === undefined ? {} : { useCase: criteria.useCase }),
      ...(criteria.from === undefined && criteria.to === undefined
        ? {}
        : {
            createdAt: {
              ...(criteria.from === undefined ? {} : { gte: criteria.from }),
              ...(criteria.to === undefined ? {} : { lte: criteria.to }),
            },
          }),
    };
    const [items, total] = await Promise.all([
      this.prisma.aiUsageAudit.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.aiUsageAudit.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }
}
