import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ProvisioningOrchestratorService } from "../provisioning-orchestrator.service";
import {
  PROVISIONING_JOB_STATUS,
  PROVISIONING_OPERATION,
  ProvisioningRepository,
} from "../provisioning.repository";
import { ProvisioningService } from "../provisioning.service";

describe("ProvisioningService", () => {
  let repository: jest.Mocked<ProvisioningRepository>;
  let orchestrator: jest.Mocked<ProvisioningOrchestratorService>;
  let service: ProvisioningService;

  const job = {
    id: "10000000-0000-4000-8000-000000000001",
    workspaceId: "10000000-0000-4000-8000-000000000002",
    subscriptionId: "10000000-0000-4000-8000-000000000003",
    status: PROVISIONING_JOB_STATUS.COMPLETED,
    operation: PROVISIONING_OPERATION.PROVISION,
    startedAt: new Date("2026-01-01T00:00:00.000Z"),
    completedAt: new Date("2026-01-01T00:00:00.000Z"),
    error: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      findJobById: jest.fn().mockResolvedValue(job),
    } as unknown as jest.Mocked<ProvisioningRepository>;
    orchestrator = {
      run: jest.fn().mockResolvedValue(job),
    } as unknown as jest.Mocked<ProvisioningOrchestratorService>;
    service = new ProvisioningService(repository, orchestrator);
  });

  it("starts provisioning", async () => {
    const result = await service.provisionWorkspace(job.workspaceId, {
      subscriptionId: job.subscriptionId,
    });

    expect(result).toEqual(job);
    expect(orchestrator.run).toHaveBeenCalledWith(
      PROVISIONING_OPERATION.PROVISION,
      job.workspaceId,
      job.subscriptionId,
    );
  });

  it("starts reprovisioning", async () => {
    await service.reprovisionWorkspace(job.workspaceId, {
      subscriptionId: job.subscriptionId,
    });

    expect(orchestrator.run).toHaveBeenCalledWith(
      PROVISIONING_OPERATION.REPROVISION,
      job.workspaceId,
      job.subscriptionId,
    );
  });

  it("starts deprovisioning", async () => {
    await service.deprovisionWorkspace(job.workspaceId, {
      subscriptionId: job.subscriptionId,
    });

    expect(orchestrator.run).toHaveBeenCalledWith(
      PROVISIONING_OPERATION.DEPROVISION,
      job.workspaceId,
      job.subscriptionId,
    );
  });

  it("gets a provisioning job", async () => {
    const result = await service.getProvisioningJob(job.id);

    expect(result).toEqual(job);
    expect(repository.findJobById).toHaveBeenCalledWith(job.id);
  });

  it("throws NotFoundException when a job is unknown", async () => {
    repository.findJobById.mockResolvedValueOnce(null);

    await expect(service.getProvisioningJob(job.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("throws BadRequestException when ids are blank", async () => {
    expect(() =>
      service.provisionWorkspace(" ", { subscriptionId: job.subscriptionId }),
    ).toThrow(BadRequestException);
    expect(() =>
      service.provisionWorkspace(job.workspaceId, { subscriptionId: " " }),
    ).toThrow(BadRequestException);
  });
});
