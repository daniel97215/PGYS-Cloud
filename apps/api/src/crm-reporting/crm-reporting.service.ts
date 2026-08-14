import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CrmActivityReportResponseDto } from "./dto/crm-activity-report-response.dto";
import { CrmOpportunityReportResponseDto } from "./dto/crm-opportunity-report-response.dto";
import { CrmReportFilterDto } from "./dto/crm-report-filter.dto";
import { CrmSummaryReportResponseDto } from "./dto/crm-summary-report-response.dto";
import {
  CrmReportingRepository,
  CrmReportQuery,
} from "./crm-reporting.repository";

@Injectable()
export class CrmReportingService {
  constructor(private readonly repository: CrmReportingRepository) {}

  async opportunities(
    workspaceId: string,
    filter: CrmReportFilterDto,
  ): Promise<CrmOpportunityReportResponseDto> {
    const query = await this.toQuery(workspaceId, filter);
    const [groups, amounts] = await Promise.all([
      this.repository.opportunityCounts(workspaceId, query),
      this.repository.opportunityAmounts(workspaceId, query),
    ]);

    return {
      groups: groups.map((group) => ({
        pipelineId: group.pipelineId,
        stageId: group.stageId,
        status: group.status,
        count: group._count._all,
      })),
      amountsByCurrency: amounts.map((group) => ({
        pipelineId: group.pipelineId,
        stageId: group.stageId,
        status: group.status,
        currency: group.currency,
        count: group._count._all,
        amount: group._sum.amount?.toFixed(2) ?? "0.00",
      })),
    };
  }

  async activities(
    workspaceId: string,
    filter: CrmReportFilterDto,
  ): Promise<CrmActivityReportResponseDto> {
    const query = await this.toQuery(workspaceId, filter);
    const now = new Date();
    const [groups, overduePlanned] = await Promise.all([
      this.repository.activityCounts(workspaceId, query),
      this.repository.overduePlannedActivities(workspaceId, query, now),
    ]);

    return {
      groups: groups.map((group) => ({
        type: group.type,
        status: group.status,
        count: group._count._all,
      })),
      overduePlanned,
    };
  }

  async summary(
    workspaceId: string,
    filter: CrmReportFilterDto,
  ): Promise<CrmSummaryReportResponseDto> {
    const query = await this.toQuery(workspaceId, filter);
    const [opportunityGroups, opportunityAmounts, activityGroups, overdue] =
      await Promise.all([
        this.repository.opportunityCounts(workspaceId, query),
        this.repository.opportunityAmounts(workspaceId, query),
        this.repository.activityCounts(workspaceId, query),
        this.repository.overduePlannedActivities(
          workspaceId,
          query,
          new Date(),
        ),
      ]);

    return {
      generatedAt: new Date().toISOString(),
      opportunities: {
        groups: opportunityGroups.map((group) => ({
          pipelineId: group.pipelineId,
          stageId: group.stageId,
          status: group.status,
          count: group._count._all,
        })),
        amountsByCurrency: opportunityAmounts.map((group) => ({
          pipelineId: group.pipelineId,
          stageId: group.stageId,
          status: group.status,
          currency: group.currency,
          count: group._count._all,
          amount: group._sum.amount?.toFixed(2) ?? "0.00",
        })),
      },
      activities: {
        groups: activityGroups.map((group) => ({
          type: group.type,
          status: group.status,
          count: group._count._all,
        })),
        overduePlanned: overdue,
      },
    };
  }

  private async toQuery(
    workspaceId: string,
    filter: CrmReportFilterDto,
  ): Promise<CrmReportQuery> {
    const from = filter.from === undefined ? undefined : new Date(filter.from);
    const to = filter.to === undefined ? undefined : new Date(filter.to);

    if (from !== undefined && to !== undefined && from > to) {
      throw new BadRequestException("Report start date cannot be after end date");
    }

    if (
      filter.pipelineId !== undefined &&
      !(await this.repository.pipelineExists(workspaceId, filter.pipelineId))
    ) {
      throw new NotFoundException(`CRM pipeline "${filter.pipelineId}" not found`);
    }

    return {
      ...(filter.pipelineId === undefined
        ? {}
        : { pipelineId: filter.pipelineId }),
      ...(from === undefined ? {} : { from }),
      ...(to === undefined ? {} : { to }),
    };
  }
}
