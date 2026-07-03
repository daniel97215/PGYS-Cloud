import { PrismaService } from "../../prisma/prisma.service";
import {
  PROVISIONING_JOB_STATUS,
  PROVISIONING_OPERATION,
  ProvisioningRepository,
} from "../provisioning.repository";

describe("ProvisioningRepository", () => {
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

  it("creates a provisioning job through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(job);
    const repository = new ProvisioningRepository(createPrismaMock({ create }));

    const result = await repository.createJob({
      workspaceId: job.workspaceId,
      subscriptionId: job.subscriptionId,
      operation: PROVISIONING_OPERATION.PROVISION,
    });

    expect(result).toEqual(job);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId: job.workspaceId,
        subscriptionId: job.subscriptionId,
        operation: PROVISIONING_OPERATION.PROVISION,
        status: PROVISIONING_JOB_STATUS.PENDING,
      },
    });
  });

  it("finds a reusable provisioning job through Prisma", async () => {
    const findFirst = jest.fn().mockResolvedValue(job);
    const repository = new ProvisioningRepository(
      createPrismaMock({ findFirst }),
    );

    const result = await repository.findReusableJob(
      job.workspaceId,
      job.subscriptionId,
      PROVISIONING_OPERATION.PROVISION,
    );

    expect(result).toEqual(job);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        workspaceId: job.workspaceId,
        subscriptionId: job.subscriptionId,
        operation: PROVISIONING_OPERATION.PROVISION,
        status: {
          in: [
            PROVISIONING_JOB_STATUS.PENDING,
            PROVISIONING_JOB_STATUS.RUNNING,
            PROVISIONING_JOB_STATUS.COMPLETED,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  it("marks a provisioning job as running through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...job,
      status: PROVISIONING_JOB_STATUS.RUNNING,
    });
    const repository = new ProvisioningRepository(createPrismaMock({ update }));

    const result = await repository.markRunning(job.id);

    expect(result.status).toBe(PROVISIONING_JOB_STATUS.RUNNING);
    expect(update).toHaveBeenCalledWith({
      where: { id: job.id },
      data: {
        status: PROVISIONING_JOB_STATUS.RUNNING,
        error: null,
      },
    });
  });

  it("marks a provisioning job as completed through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...job,
      status: PROVISIONING_JOB_STATUS.COMPLETED,
    });
    const repository = new ProvisioningRepository(createPrismaMock({ update }));

    const result = await repository.markCompleted(job.id);

    expect(result.status).toBe(PROVISIONING_JOB_STATUS.COMPLETED);
    expect(update).toHaveBeenCalledWith({
      where: { id: job.id },
      data: {
        status: PROVISIONING_JOB_STATUS.COMPLETED,
        completedAt: expect.any(Date),
        error: null,
      },
    });
  });

  it("marks a provisioning job as failed through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...job,
      status: PROVISIONING_JOB_STATUS.FAILED,
      error: "boom",
    });
    const repository = new ProvisioningRepository(createPrismaMock({ update }));

    const result = await repository.markFailed(job.id, "boom");

    expect(result.status).toBe(PROVISIONING_JOB_STATUS.FAILED);
    expect(update).toHaveBeenCalledWith({
      where: { id: job.id },
      data: {
        status: PROVISIONING_JOB_STATUS.FAILED,
        completedAt: expect.any(Date),
        error: "boom",
      },
    });
  });

  it("reads dependencies through Prisma", async () => {
    const subscriptionFindUnique = jest.fn().mockResolvedValue(subscription);
    const offerFindUnique = jest.fn().mockResolvedValue({ id: subscription.offerId });
    const offerFeatureFindMany = jest.fn().mockResolvedValue([]);
    const workspaceServiceFindMany = jest.fn().mockResolvedValue([]);
    const repository = new ProvisioningRepository(
      createPrismaMock({
        subscriptionFindUnique,
        offerFindUnique,
        offerFeatureFindMany,
        workspaceServiceFindMany,
      }),
    );

    await repository.findSubscriptionById(subscription.id);
    await repository.findOfferById(subscription.offerId);
    await repository.findOfferFeatures(subscription.offerId);
    await repository.findWorkspaceServices(subscription.workspaceId);

    expect(subscriptionFindUnique).toHaveBeenCalledWith({
      where: { id: subscription.id },
    });
    expect(offerFindUnique).toHaveBeenCalledWith({
      where: { id: subscription.offerId },
    });
    expect(offerFeatureFindMany).toHaveBeenCalledWith({
      where: { offerId: subscription.offerId, enabled: true },
      include: { feature: true },
      orderBy: { createdAt: "asc" },
    });
    expect(workspaceServiceFindMany).toHaveBeenCalledWith({
      where: { workspaceId: subscription.workspaceId },
      orderBy: { createdAt: "asc" },
    });
  });
});

function createPrismaMock(methods: {
  create?: jest.Mock;
  findFirst?: jest.Mock;
  update?: jest.Mock;
  jobFindUnique?: jest.Mock;
  subscriptionFindUnique?: jest.Mock;
  offerFindUnique?: jest.Mock;
  offerFeatureFindMany?: jest.Mock;
  workspaceServiceFindMany?: jest.Mock;
}): PrismaService {
  const prisma = {
    provisioningJob: {
      create: methods.create ?? jest.fn(),
      findFirst: methods.findFirst ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findUnique: methods.jobFindUnique ?? jest.fn(),
    },
    subscription: {
      findUnique: methods.subscriptionFindUnique ?? jest.fn(),
    },
    offer: {
      findUnique: methods.offerFindUnique ?? jest.fn(),
    },
    offerFeature: {
      findMany: methods.offerFeatureFindMany ?? jest.fn(),
    },
    workspaceService: {
      findMany: methods.workspaceServiceFindMany ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
