import {
  CrmActivityStatus,
  CrmActivityType,
  CrmOpportunityStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CrmReportingRepository } from "../crm-reporting.repository";

describe("CrmReportingRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const pipelineId = "20000000-0000-4000-8000-000000000001";
  const from = new Date("2026-08-01T00:00:00.000Z");
  const to = new Date("2026-08-31T23:59:59.000Z");

  it("groups opportunity counts by pipeline, stage, and status", async () => {
    const groupBy = jest.fn().mockResolvedValue([]);
    const repository = new CrmReportingRepository(mockPrisma({ opportunityGroupBy: groupBy }));

    await repository.opportunityCounts(workspaceId, { pipelineId, from, to });
    expect(groupBy).toHaveBeenCalledWith({
      by: ["pipelineId", "stageId", "status"],
      where: {
        workspaceId,
        pipelineId,
        createdAt: { gte: from, lte: to },
      },
      _count: { _all: true },
      orderBy: [
        { pipelineId: "asc" },
        { stageId: "asc" },
        { status: "asc" },
      ],
    });
  });

  it("groups opportunity amounts separately by currency", async () => {
    const groupBy = jest.fn().mockResolvedValue([
      {
        pipelineId,
        stageId: "stage",
        status: CrmOpportunityStatus.OPEN,
        currency: "EUR",
        _count: { _all: 2 },
        _sum: { amount: new Prisma.Decimal(300) },
      },
    ]);
    const repository = new CrmReportingRepository(mockPrisma({ opportunityGroupBy: groupBy }));

    await repository.opportunityAmounts(workspaceId, {});
    expect(groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ["pipelineId", "stageId", "status", "currency"],
        where: { workspaceId, amount: { not: null } },
        _sum: { amount: true },
      }),
    );
  });

  it("groups activities and applies pipeline through opportunity", async () => {
    const groupBy = jest.fn().mockResolvedValue([
      {
        type: CrmActivityType.CALL,
        status: CrmActivityStatus.PLANNED,
        _count: { _all: 1 },
      },
    ]);
    const repository = new CrmReportingRepository(mockPrisma({ activityGroupBy: groupBy }));

    await repository.activityCounts(workspaceId, { pipelineId });
    expect(groupBy).toHaveBeenCalledWith({
      by: ["type", "status"],
      where: { workspaceId, opportunity: { pipelineId } },
      _count: { _all: true },
      orderBy: [{ type: "asc" }, { status: "asc" }],
    });
  });

  it("counts overdue planned activities at the supplied instant", async () => {
    const count = jest.fn().mockResolvedValue(3);
    const repository = new CrmReportingRepository(mockPrisma({ activityCount: count }));
    const now = new Date("2026-08-12T12:00:00.000Z");

    await expect(
      repository.overduePlannedActivities(workspaceId, {}, now),
    ).resolves.toBe(3);
    expect(count).toHaveBeenCalledWith({
      where: {
        workspaceId,
        status: CrmActivityStatus.PLANNED,
        scheduledAt: { lt: now },
      },
    });
  });

  it("checks the pipeline in the workspace", async () => {
    const findFirst = jest.fn().mockResolvedValue({ id: pipelineId });
    const repository = new CrmReportingRepository(mockPrisma({ pipelineFindFirst: findFirst }));

    await expect(repository.pipelineExists(workspaceId, pipelineId)).resolves.toBe(
      true,
    );
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: pipelineId, workspaceId },
      select: { id: true },
    });
  });
});

function mockPrisma(methods: Record<string, jest.Mock>): PrismaService {
  return {
    crmOpportunity: {
      groupBy: methods.opportunityGroupBy ?? jest.fn(),
    },
    crmActivity: {
      groupBy: methods.activityGroupBy ?? jest.fn(),
      count: methods.activityCount ?? jest.fn(),
    },
    crmPipeline: {
      findFirst: methods.pipelineFindFirst ?? jest.fn(),
    },
  } as unknown as PrismaService;
}
