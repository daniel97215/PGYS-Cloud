import { BadRequestException } from "@nestjs/common";
import { ServiceStatus, ServiceType } from "@prisma/client";
import {
  PROVISIONING_JOB_STATUSES,
  PROVISIONING_OPERATIONS,
} from "../../provisioning/provisioning.constants";
import { OperationalReportingRepository } from "../operational-reporting.repository";
import { OperationalReportingService } from "../operational-reporting.service";

describe("OperationalReportingService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  let repository: jest.Mocked<OperationalReportingRepository>;
  let service: OperationalReportingService;

  beforeEach(() => {
    repository = {
      serviceGroups: jest.fn().mockResolvedValue([
        {
          type: ServiceType.HOSTING,
          status: ServiceStatus.ACTIVE,
          _count: { _all: 3 },
        },
      ]),
      provisioningJobGroups: jest.fn().mockResolvedValue([
        {
          operation: PROVISIONING_OPERATIONS.PROVISION,
          status: PROVISIONING_JOB_STATUSES.COMPLETED,
          _count: { _all: 2 },
        },
      ]),
    } as unknown as jest.Mocked<OperationalReportingRepository>;
    service = new OperationalReportingService(repository);
  });

  it("returns the workspace operational snapshot", async () => {
    const result = await service.snapshot(workspaceId, {});

    expect(result.generatedAt).toEqual(expect.any(String));
    expect(result.services).toEqual([
      {
        type: ServiceType.HOSTING,
        status: ServiceStatus.ACTIVE,
        count: 3,
      },
    ]);
    expect(result.provisioningJobs).toEqual([
      {
        operation: PROVISIONING_OPERATIONS.PROVISION,
        status: PROVISIONING_JOB_STATUSES.COMPLETED,
        count: 2,
      },
    ]);
  });

  it("converts and forwards the inclusive created-at period", async () => {
    await service.snapshot(workspaceId, {
      from: "2026-08-01T00:00:00.000Z",
      to: "2026-08-31T23:59:59.000Z",
    });
    const query = {
      from: new Date("2026-08-01T00:00:00.000Z"),
      to: new Date("2026-08-31T23:59:59.000Z"),
    };

    expect(repository.serviceGroups).toHaveBeenCalledWith(workspaceId, query);
    expect(repository.provisioningJobGroups).toHaveBeenCalledWith(
      workspaceId,
      query,
    );
  });

  it("rejects an inverted period before reading", async () => {
    await expect(
      service.snapshot(workspaceId, {
        from: "2026-08-31T00:00:00.000Z",
        to: "2026-08-01T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.serviceGroups).not.toHaveBeenCalled();
  });

  it("rejects an unknown legacy provisioning value", async () => {
    repository.provisioningJobGroups.mockResolvedValueOnce([
      { operation: "unknown", status: "completed", _count: { _all: 1 } },
    ]);

    await expect(service.snapshot(workspaceId, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
