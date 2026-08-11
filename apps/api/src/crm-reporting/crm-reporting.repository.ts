import { Injectable } from "@nestjs/common";
import {
  CrmActivityStatus,
  CrmActivityType,
  CrmOpportunityStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface CrmReportQuery {
  pipelineId?: string;
  from?: Date;
  to?: Date;
}

export interface OpportunityCountGroup {
  pipelineId: string;
  stageId: string;
  status: CrmOpportunityStatus;
  _count: { _all: number };
}

export interface OpportunityAmountGroup extends OpportunityCountGroup {
  currency: string;
  _sum: { amount: Prisma.Decimal | null };
}

export interface ActivityCountGroup {
  type: CrmActivityType;
  status: CrmActivityStatus;
  _count: { _all: number };
}

@Injectable()
export class CrmReportingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async opportunityCounts(
    workspaceId: string,
    query: CrmReportQuery,
  ): Promise<OpportunityCountGroup[]> {
    const groups = await this.prisma.crmOpportunity.groupBy({
      by: ["pipelineId", "stageId", "status"],
      where: this.opportunityWhere(workspaceId, query),
      _count: { _all: true },
      orderBy: [
        { pipelineId: "asc" },
        { stageId: "asc" },
        { status: "asc" },
      ],
    });
    return groups as OpportunityCountGroup[];
  }

  async opportunityAmounts(
    workspaceId: string,
    query: CrmReportQuery,
  ): Promise<OpportunityAmountGroup[]> {
    const groups = await this.prisma.crmOpportunity.groupBy({
      by: ["pipelineId", "stageId", "status", "currency"],
      where: {
        ...this.opportunityWhere(workspaceId, query),
        amount: { not: null },
      },
      _count: { _all: true },
      _sum: { amount: true },
      orderBy: [
        { pipelineId: "asc" },
        { stageId: "asc" },
        { status: "asc" },
        { currency: "asc" },
      ],
    });
    return groups as OpportunityAmountGroup[];
  }

  async activityCounts(
    workspaceId: string,
    query: CrmReportQuery,
  ): Promise<ActivityCountGroup[]> {
    const groups = await this.prisma.crmActivity.groupBy({
      by: ["type", "status"],
      where: this.activityWhere(workspaceId, query),
      _count: { _all: true },
      orderBy: [{ type: "asc" }, { status: "asc" }],
    });
    return groups as ActivityCountGroup[];
  }

  overduePlannedActivities(
    workspaceId: string,
    query: CrmReportQuery,
    now: Date,
  ): Promise<number> {
    return this.prisma.crmActivity.count({
      where: {
        ...this.activityWhere(workspaceId, query),
        status: CrmActivityStatus.PLANNED,
        scheduledAt: { lt: now },
      },
    });
  }

  async pipelineExists(workspaceId: string, pipelineId: string): Promise<boolean> {
    const pipeline = await this.prisma.crmPipeline.findFirst({
      where: { id: pipelineId, workspaceId },
      select: { id: true },
    });
    return pipeline !== null;
  }

  private opportunityWhere(
    workspaceId: string,
    query: CrmReportQuery,
  ): Prisma.CrmOpportunityWhereInput {
    return {
      workspaceId,
      ...(query.pipelineId === undefined
        ? {}
        : { pipelineId: query.pipelineId }),
      ...this.createdAtWhere(query),
    };
  }

  private activityWhere(
    workspaceId: string,
    query: CrmReportQuery,
  ): Prisma.CrmActivityWhereInput {
    return {
      workspaceId,
      ...(query.pipelineId === undefined
        ? {}
        : { opportunity: { pipelineId: query.pipelineId } }),
      ...this.createdAtWhere(query),
    };
  }

  private createdAtWhere(
    query: CrmReportQuery,
  ): { createdAt?: Prisma.DateTimeFilter } {
    if (query.from === undefined && query.to === undefined) {
      return {};
    }
    return {
      createdAt: {
        ...(query.from === undefined ? {} : { gte: query.from }),
        ...(query.to === undefined ? {} : { lte: query.to }),
      },
    };
  }
}
