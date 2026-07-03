import { NotFoundException } from "@nestjs/common";
import { ProvisioningOrchestratorService } from "../provisioning-orchestrator.service";
import {
  PROVISIONING_JOB_STATUS,
  PROVISIONING_OPERATION,
  ProvisioningRepository,
} from "../provisioning.repository";

describe("ProvisioningOrchestratorService", () => {
  let repository: jest.Mocked<ProvisioningRepository>;
  let service: ProvisioningOrchestratorService;

  const job = {
    id: "10000000-0000-4000-8000-000000000001",
    workspaceId: "10000000-0000-4000-8000-000000000002",
    subscriptionId: "10000000-0000-4000-8000-000000000003",
    status: PROVISIONING_JOB_STATUS.PENDING,
    operation: PROVISIONING_OPERATION.PROVISION,
    startedAt: new Date("2026-01-01T00:00:00.000Z"),
    completedAt: null,
    error: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  const subscription = {
    id: job.subscriptionId,
    workspaceId: job.workspaceId,
    offerId: "10000000-0000-4000-8000-000000000004",
    priceId: null,
    status: "active",
    startedAt: new Date("2026-01-01T00:00:00.000Z"),
    endsAt: null,
    cancelledAt: null,
    renewalDate: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  const offer = {
    id: subscription.offerId,
    key: "crm-starter",
    name: "CRM Starter",
    description: "Entry CRM offer",
    status: "draft",
    visibility: "public",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      findReusableJob: jest.fn().mockResolvedValue(null),
      createJob: jest.fn().mockResolvedValue(job),
      markRunning: jest.fn().mockResolvedValue({
        ...job,
        status: PROVISIONING_JOB_STATUS.RUNNING,
      }),
      markCompleted: jest.fn().mockResolvedValue({
        ...job,
        status: PROVISIONING_JOB_STATUS.COMPLETED,
      }),
      markFailed: jest.fn().mockResolvedValue({
        ...job,
        status: PROVISIONING_JOB_STATUS.FAILED,
      }),
      findSubscriptionById: jest.fn().mockResolvedValue(subscription),
      findOfferById: jest.fn().mockResolvedValue(offer),
      findOfferFeatures: jest.fn().mockResolvedValue([]),
      findWorkspaceServices: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<ProvisioningRepository>;

    service = new ProvisioningOrchestratorService(repository);
  });

  it("returns an existing reusable job idempotently", async () => {
    repository.findReusableJob.mockResolvedValueOnce(job);

    const result = await service.run(
      PROVISIONING_OPERATION.PROVISION,
      job.workspaceId,
      job.subscriptionId,
    );

    expect(result).toEqual(job);
    expect(repository.createJob).not.toHaveBeenCalled();
  });

  it("runs provisioning steps and completes the job", async () => {
    const result = await service.run(
      PROVISIONING_OPERATION.PROVISION,
      job.workspaceId,
      job.subscriptionId,
    );

    expect(result.status).toBe(PROVISIONING_JOB_STATUS.COMPLETED);
    expect(repository.createJob).toHaveBeenCalledWith({
      workspaceId: job.workspaceId,
      subscriptionId: job.subscriptionId,
      operation: PROVISIONING_OPERATION.PROVISION,
      status: PROVISIONING_JOB_STATUS.PENDING,
    });
    expect(repository.markRunning).toHaveBeenCalledWith(job.id);
    expect(repository.findSubscriptionById).toHaveBeenCalledWith(
      job.subscriptionId,
    );
    expect(repository.findOfferById).toHaveBeenCalledWith(offer.id);
    expect(repository.findOfferFeatures).toHaveBeenCalledWith(offer.id);
    expect(repository.findWorkspaceServices).toHaveBeenCalledWith(
      job.workspaceId,
    );
    expect(repository.markCompleted).toHaveBeenCalledWith(job.id);
  });

  it("marks the job as failed when a step fails", async () => {
    repository.findSubscriptionById.mockResolvedValueOnce(null);

    await expect(
      service.run(
        PROVISIONING_OPERATION.PROVISION,
        job.workspaceId,
        job.subscriptionId,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repository.markFailed).toHaveBeenCalledWith(
      job.id,
      "Subscription not found",
    );
  });
});
