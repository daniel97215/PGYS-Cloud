import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  CrmActivityStatus,
  CrmActivityType,
  CrmOpportunityStatus,
  Prisma,
} from "@prisma/client";
import { CrmReportingRepository } from "../crm-reporting.repository";
import { CrmReportingService } from "../crm-reporting.service";

describe("CrmReportingService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const pipelineId = "20000000-0000-4000-8000-000000000001";
  const stageId = "30000000-0000-4000-8000-000000000001";
  let repository: jest.Mocked<CrmReportingRepository>;
  let service: CrmReportingService;

  beforeEach(() => {
    repository = {
      opportunityCounts: jest.fn().mockResolvedValue([
        {
          pipelineId,
          stageId,
          status: CrmOpportunityStatus.OPEN,
          _count: { _all: 2 },
        },
      ]),
      opportunityAmounts: jest.fn().mockResolvedValue([
        {
          pipelineId,
          stageId,
          status: CrmOpportunityStatus.OPEN,
          currency: "EUR",
          _count: { _all: 2 },
          _sum: { amount: new Prisma.Decimal("1250.5") },
        },
      ]),
      activityCounts: jest.fn().mockResolvedValue([
        {
          type: CrmActivityType.CALL,
          status: CrmActivityStatus.PLANNED,
          _count: { _all: 4 },
        },
      ]),
      overduePlannedActivities: jest.fn().mockResolvedValue(1),
      pipelineExists: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<CrmReportingRepository>;
    service = new CrmReportingService(repository);
  });

  it("returns opportunity counts and currency-separated decimal amounts", async () => {
    await expect(service.opportunities(workspaceId, {})).resolves.toEqual({
      groups: [
        {
          pipelineId,
          stageId,
          status: CrmOpportunityStatus.OPEN,
          count: 2,
        },
      ],
      amountsByCurrency: [
        {
          pipelineId,
          stageId,
          status: CrmOpportunityStatus.OPEN,
          currency: "EUR",
          count: 2,
          amount: "1250.50",
        },
      ],
    });
  });

  it("returns activity groups and overdue planned count", async () => {
    const result = await service.activities(workspaceId, {});
    expect(result).toEqual({
      groups: [
        {
          type: CrmActivityType.CALL,
          status: CrmActivityStatus.PLANNED,
          count: 4,
        },
      ],
      overduePlanned: 1,
    });
    expect(repository.overduePlannedActivities).toHaveBeenCalledWith(
      workspaceId,
      {},
      expect.any(Date),
    );
  });

  it("converts and forwards pipeline and period filters", async () => {
    await service.opportunities(workspaceId, {
      pipelineId,
      from: "2026-08-01T00:00:00.000Z",
      to: "2026-08-31T23:59:59.000Z",
    });
    const expected = {
      pipelineId,
      from: new Date("2026-08-01T00:00:00.000Z"),
      to: new Date("2026-08-31T23:59:59.000Z"),
    };
    expect(repository.pipelineExists).toHaveBeenCalledWith(
      workspaceId,
      pipelineId,
    );
    expect(repository.opportunityCounts).toHaveBeenCalledWith(
      workspaceId,
      expected,
    );
  });

  it("rejects an inverted period", async () => {
    await expect(
      service.activities(workspaceId, {
        from: "2026-08-31T00:00:00.000Z",
        to: "2026-08-01T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.activityCounts).not.toHaveBeenCalled();
  });

  it("rejects a pipeline outside the workspace", async () => {
    repository.pipelineExists.mockResolvedValueOnce(false);
    await expect(
      service.opportunities(workspaceId, { pipelineId }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.opportunityCounts).not.toHaveBeenCalled();
  });
});
