import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  PROVISIONING_JOB_STATUSES,
  ProvisioningJobStatus,
  ProvisioningOperation,
} from "./provisioning.constants";

export type ProvisioningJobRecord =
  Prisma.ProvisioningJobGetPayload<object>;
export type ProvisioningSubscriptionRecord =
  Prisma.SubscriptionGetPayload<object>;
export type ProvisioningOfferRecord = Prisma.OfferGetPayload<object>;
export type ProvisioningWorkspaceServiceRecord =
  Prisma.WorkspaceServiceGetPayload<object>;
export type ProvisioningOfferFeatureRecord =
  Prisma.OfferFeatureGetPayload<{
    include: { feature: true };
  }>;

export interface CreateProvisioningJobData {
  workspaceId: string;
  subscriptionId: string;
  operation: ProvisioningOperation;
  status?: ProvisioningJobStatus;
}

@Injectable()
export class ProvisioningRepository {
  constructor(private readonly prisma: PrismaService) {}

  findJobById(jobId: string): Promise<ProvisioningJobRecord | null> {
    return this.prisma.provisioningJob.findUnique({
      where: { id: jobId },
    });
  }

  findReusableJob(
    workspaceId: string,
    subscriptionId: string,
    operation: ProvisioningOperation,
  ): Promise<ProvisioningJobRecord | null> {
    return this.prisma.provisioningJob.findFirst({
      where: {
        workspaceId,
        subscriptionId,
        operation,
        status: {
          in: [
            PROVISIONING_JOB_STATUSES.PENDING,
            PROVISIONING_JOB_STATUSES.RUNNING,
            PROVISIONING_JOB_STATUSES.COMPLETED,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  createJob(data: CreateProvisioningJobData): Promise<ProvisioningJobRecord> {
    return this.prisma.provisioningJob.create({
      data: {
        workspaceId: data.workspaceId,
        subscriptionId: data.subscriptionId,
        operation: data.operation,
        status: data.status ?? PROVISIONING_JOB_STATUSES.PENDING,
      },
    });
  }

  markRunning(jobId: string): Promise<ProvisioningJobRecord> {
    return this.prisma.provisioningJob.update({
      where: { id: jobId },
      data: {
        status: PROVISIONING_JOB_STATUSES.RUNNING,
        error: null,
      },
    });
  }

  markCompleted(jobId: string): Promise<ProvisioningJobRecord> {
    return this.prisma.provisioningJob.update({
      where: { id: jobId },
      data: {
        status: PROVISIONING_JOB_STATUSES.COMPLETED,
        completedAt: new Date(),
        error: null,
      },
    });
  }

  markFailed(jobId: string, error: string): Promise<ProvisioningJobRecord> {
    return this.prisma.provisioningJob.update({
      where: { id: jobId },
      data: {
        status: PROVISIONING_JOB_STATUSES.FAILED,
        completedAt: new Date(),
        error,
      },
    });
  }

  findSubscriptionById(
    subscriptionId: string,
  ): Promise<ProvisioningSubscriptionRecord | null> {
    return this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
  }

  findOfferById(offerId: string): Promise<ProvisioningOfferRecord | null> {
    return this.prisma.offer.findUnique({
      where: { id: offerId },
    });
  }

  findOfferFeatures(
    offerId: string,
  ): Promise<ProvisioningOfferFeatureRecord[]> {
    return this.prisma.offerFeature.findMany({
      where: {
        offerId,
        enabled: true,
      },
      include: { feature: true },
      orderBy: { createdAt: "asc" },
    });
  }

  findWorkspaceServices(
    workspaceId: string,
  ): Promise<ProvisioningWorkspaceServiceRecord[]> {
    return this.prisma.workspaceService.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });
  }
}
