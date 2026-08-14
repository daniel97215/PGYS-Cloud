import { Injectable } from "@nestjs/common";
import { Prisma, ServiceStatus, ServiceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface OperationalReportQuery {
  from?: Date;
  to?: Date;
}

export interface OperationalServiceGroup {
  type: ServiceType;
  status: ServiceStatus;
  _count: { _all: number };
}

export interface OperationalProvisioningJobGroup {
  operation: string;
  status: string;
  _count: { _all: number };
}

@Injectable()
export class OperationalReportingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async serviceGroups(
    workspaceId: string,
    query: OperationalReportQuery,
  ): Promise<OperationalServiceGroup[]> {
    const groups = await this.prisma.service.groupBy({
      by: ["type", "status"],
      where: {
        workspaceId,
        ...this.createdAtWhere(query),
      },
      _count: { _all: true },
      orderBy: [{ type: "asc" }, { status: "asc" }],
    });

    return groups as OperationalServiceGroup[];
  }

  async provisioningJobGroups(
    workspaceId: string,
    query: OperationalReportQuery,
  ): Promise<OperationalProvisioningJobGroup[]> {
    const groups = await this.prisma.provisioningJob.groupBy({
      by: ["operation", "status"],
      where: {
        workspaceId,
        ...this.createdAtWhere(query),
      },
      _count: { _all: true },
      orderBy: [{ operation: "asc" }, { status: "asc" }],
    });

    return groups as OperationalProvisioningJobGroup[];
  }

  private createdAtWhere(
    query: OperationalReportQuery,
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
