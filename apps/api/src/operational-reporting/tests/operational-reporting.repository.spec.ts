import { ServiceStatus, ServiceType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { OperationalReportingRepository } from "../operational-reporting.repository";

describe("OperationalReportingRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const from = new Date("2026-08-01T00:00:00.000Z");
  const to = new Date("2026-08-31T23:59:59.000Z");

  it("groups services by type and status in the workspace", async () => {
    const groupBy = jest.fn().mockResolvedValue([
      {
        type: ServiceType.HOSTING,
        status: ServiceStatus.ACTIVE,
        _count: { _all: 2 },
      },
    ]);
    const repository = new OperationalReportingRepository(
      mockPrisma({ serviceGroupBy: groupBy }),
    );

    await repository.serviceGroups(workspaceId, { from, to });

    expect(groupBy).toHaveBeenCalledWith({
      by: ["type", "status"],
      where: {
        workspaceId,
        createdAt: { gte: from, lte: to },
      },
      _count: { _all: true },
      orderBy: [{ type: "asc" }, { status: "asc" }],
    });
  });

  it("groups provisioning jobs by operation and status", async () => {
    const groupBy = jest.fn().mockResolvedValue([]);
    const repository = new OperationalReportingRepository(
      mockPrisma({ provisioningJobGroupBy: groupBy }),
    );

    await repository.provisioningJobGroups(workspaceId, {});

    expect(groupBy).toHaveBeenCalledWith({
      by: ["operation", "status"],
      where: { workspaceId },
      _count: { _all: true },
      orderBy: [{ operation: "asc" }, { status: "asc" }],
    });
  });
});

function mockPrisma(methods: Record<string, jest.Mock>): PrismaService {
  return {
    service: {
      groupBy: methods.serviceGroupBy ?? jest.fn(),
    },
    provisioningJob: {
      groupBy: methods.provisioningJobGroupBy ?? jest.fn(),
    },
  } as unknown as PrismaService;
}
