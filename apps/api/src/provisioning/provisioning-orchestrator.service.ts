import { Injectable, NotFoundException } from "@nestjs/common";
import {
  PROVISIONING_JOB_STATUS,
  ProvisioningJobRecord,
  ProvisioningOfferFeatureRecord,
  ProvisioningOfferRecord,
  ProvisioningOperation,
  ProvisioningRepository,
  ProvisioningSubscriptionRecord,
  ProvisioningWorkspaceServiceRecord,
} from "./provisioning.repository";

interface ProvisioningContext {
  job: ProvisioningJobRecord;
  operation: ProvisioningOperation;
  workspaceId: string;
  subscriptionId: string;
  subscription?: ProvisioningSubscriptionRecord;
  offer?: ProvisioningOfferRecord;
  offerFeatures: ProvisioningOfferFeatureRecord[];
  workspaceServices: ProvisioningWorkspaceServiceRecord[];
}

interface ProvisioningStep {
  name: string;
  run(context: ProvisioningContext): Promise<void>;
}

@Injectable()
export class ProvisioningOrchestratorService {
  private readonly steps: ProvisioningStep[] = [
    {
      name: "load-subscription",
      run: (context) => this.loadSubscription(context),
    },
    {
      name: "load-offer",
      run: (context) => this.loadOffer(context),
    },
    {
      name: "load-offer-features",
      run: (context) => this.loadOfferFeatures(context),
    },
    {
      name: "load-workspace-services",
      run: (context) => this.loadWorkspaceServices(context),
    },
    {
      name: "publish-event-placeholder",
      run: async () => undefined,
    },
  ];

  constructor(
    private readonly provisioningRepository: ProvisioningRepository,
  ) {}

  async run(
    operation: ProvisioningOperation,
    workspaceId: string,
    subscriptionId: string,
  ): Promise<ProvisioningJobRecord> {
    const existingJob = await this.provisioningRepository.findReusableJob(
      workspaceId,
      subscriptionId,
      operation,
    );

    if (existingJob) {
      return existingJob;
    }

    const job = await this.provisioningRepository.createJob({
      workspaceId,
      subscriptionId,
      operation,
      status: PROVISIONING_JOB_STATUS.PENDING,
    });
    const runningJob = await this.provisioningRepository.markRunning(job.id);
    const context: ProvisioningContext = {
      job: runningJob,
      operation,
      workspaceId,
      subscriptionId,
      offerFeatures: [],
      workspaceServices: [],
    };

    try {
      for (const step of this.steps) {
        await step.run(context);
      }

      return this.provisioningRepository.markCompleted(job.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.provisioningRepository.markFailed(job.id, message);
      throw error;
    }
  }

  private async loadSubscription(
    context: ProvisioningContext,
  ): Promise<void> {
    const subscription =
      await this.provisioningRepository.findSubscriptionById(
        context.subscriptionId,
      );

    if (!subscription || subscription.workspaceId !== context.workspaceId) {
      throw new NotFoundException("Subscription not found");
    }

    context.subscription = subscription;
  }

  private async loadOffer(context: ProvisioningContext): Promise<void> {
    if (!context.subscription) {
      throw new NotFoundException("Subscription not found");
    }

    const offer = await this.provisioningRepository.findOfferById(
      context.subscription.offerId,
    );

    if (!offer) {
      throw new NotFoundException("Offer not found");
    }

    context.offer = offer;
  }

  private async loadOfferFeatures(
    context: ProvisioningContext,
  ): Promise<void> {
    if (!context.offer) {
      throw new NotFoundException("Offer not found");
    }

    context.offerFeatures =
      await this.provisioningRepository.findOfferFeatures(context.offer.id);
  }

  private async loadWorkspaceServices(
    context: ProvisioningContext,
  ): Promise<void> {
    context.workspaceServices =
      await this.provisioningRepository.findWorkspaceServices(
        context.workspaceId,
      );
  }
}
