import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CancelSubscriptionDto } from "./dto/cancel-subscription.dto";
import { ChangeOfferDto } from "./dto/change-offer.dto";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { ReactivateSubscriptionDto } from "./dto/reactivate-subscription.dto";
import {
  SUBSCRIPTION_STATUSES,
  SubscriptionOfferRecord,
  SubscriptionPriceRecord,
  SubscriptionRecord,
  SubscriptionStatus,
  SubscriptionsRepository,
  SubscriptionWorkspaceRecord,
} from "./subscriptions.repository";

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {}

  async createSubscription(
    data: CreateSubscriptionDto,
  ): Promise<SubscriptionRecord> {
    const workspace = await this.requireWorkspace(data.workspaceId);
    const offer = await this.requireOffer(data.offerKey);
    await this.requirePriceIfProvided(data.priceId);
    const status = this.normalizeStatus(data.status);
    await this.ensureNoActiveDuplicate(workspace.id, offer.id, status);

    return this.subscriptionsRepository.create({
      workspaceId: workspace.id,
      offerId: offer.id,
      priceId: data.priceId,
      status,
      startedAt: data.startedAt,
      endsAt: data.endsAt,
      renewalDate: data.renewalDate,
    });
  }

  async getActiveSubscription(
    workspaceId: string,
  ): Promise<SubscriptionRecord> {
    const workspace = await this.requireWorkspace(workspaceId);
    const subscription =
      await this.subscriptionsRepository.findActiveByWorkspace(workspace.id);

    if (!subscription) {
      throw new NotFoundException(
        `Active subscription for workspace "${workspaceId}" not found`,
      );
    }

    return subscription;
  }

  async listWorkspaceSubscriptions(
    workspaceId: string,
  ): Promise<SubscriptionRecord[]> {
    const workspace = await this.requireWorkspace(workspaceId);

    return this.subscriptionsRepository.listByWorkspace(workspace.id);
  }

  async changeOffer(
    subscriptionId: string,
    data: ChangeOfferDto,
  ): Promise<SubscriptionRecord> {
    const subscription = await this.requireSubscription(subscriptionId);
    const offer = await this.requireOffer(data.offerKey);
    await this.requirePriceIfProvided(data.priceId);
    await this.ensureNoActiveDuplicate(
      subscription.workspaceId,
      offer.id,
      subscription.status,
      subscription.id,
    );

    return this.subscriptionsRepository.update(subscription.id, {
      offerId: offer.id,
      priceId: data.priceId,
      renewalDate: data.renewalDate,
    });
  }

  async suspendSubscription(
    subscriptionId: string,
  ): Promise<SubscriptionRecord> {
    const subscription = await this.requireSubscription(subscriptionId);

    return this.subscriptionsRepository.update(subscription.id, {
      status: SUBSCRIPTION_STATUSES.SUSPENDED,
    });
  }

  async reactivateSubscription(
    subscriptionId: string,
    data: ReactivateSubscriptionDto,
  ): Promise<SubscriptionRecord> {
    const subscription = await this.requireSubscription(subscriptionId);
    await this.ensureNoActiveDuplicate(
      subscription.workspaceId,
      subscription.offerId,
      SUBSCRIPTION_STATUSES.ACTIVE,
      subscription.id,
    );

    return this.subscriptionsRepository.update(subscription.id, {
      status: SUBSCRIPTION_STATUSES.ACTIVE,
      startedAt: data.startedAt ?? subscription.startedAt,
      endsAt: data.endsAt,
      cancelledAt: null,
      renewalDate: data.renewalDate,
    });
  }

  async cancelSubscription(
    subscriptionId: string,
    data: CancelSubscriptionDto,
  ): Promise<SubscriptionRecord> {
    const subscription = await this.requireSubscription(subscriptionId);
    const cancelledAt = data.cancelledAt ?? new Date();

    return this.subscriptionsRepository.update(subscription.id, {
      status: SUBSCRIPTION_STATUSES.CANCELLED,
      cancelledAt,
      endsAt: data.endsAt ?? cancelledAt,
    });
  }

  private async requireWorkspace(
    workspaceId: string,
  ): Promise<SubscriptionWorkspaceRecord> {
    const normalizedId = this.normalizeId(workspaceId, "Workspace id");
    const workspace =
      await this.subscriptionsRepository.findWorkspaceById(normalizedId);

    if (!workspace) {
      throw new NotFoundException(`Workspace "${workspaceId}" not found`);
    }

    return workspace;
  }

  private async requireOffer(
    offerKey: string,
  ): Promise<SubscriptionOfferRecord> {
    const normalizedKey = this.normalizeKey(offerKey, "Offer key");
    const offer = await this.subscriptionsRepository.findOfferByKey(
      normalizedKey,
    );

    if (!offer) {
      throw new NotFoundException(`Offer "${offerKey}" not found`);
    }

    return offer;
  }

  private async requirePriceIfProvided(
    priceId?: string,
  ): Promise<SubscriptionPriceRecord | null> {
    if (!priceId) {
      return null;
    }

    const normalizedId = this.normalizeId(priceId, "Price id");
    const price = await this.subscriptionsRepository.findPriceById(
      normalizedId,
    );

    if (!price) {
      throw new NotFoundException(`Price "${priceId}" not found`);
    }

    return price;
  }

  private async requireSubscription(
    subscriptionId: string,
  ): Promise<SubscriptionRecord> {
    const normalizedId = this.normalizeId(subscriptionId, "Subscription id");
    const subscription = await this.subscriptionsRepository.findById(
      normalizedId,
    );

    if (!subscription) {
      throw new NotFoundException(
        `Subscription "${subscriptionId}" not found`,
      );
    }

    return subscription;
  }

  private async ensureNoActiveDuplicate(
    workspaceId: string,
    offerId: string,
    status: string,
    currentSubscriptionId?: string,
  ): Promise<void> {
    if (status !== SUBSCRIPTION_STATUSES.ACTIVE) {
      return;
    }

    const existing =
      await this.subscriptionsRepository.findActiveByWorkspaceAndOffer(
        workspaceId,
        offerId,
      );

    if (existing && existing.id !== currentSubscriptionId) {
      throw new ConflictException(
        "An active subscription already exists for this workspace and offer",
      );
    }
  }

  private normalizeStatus(status?: string): SubscriptionStatus {
    const normalizedStatus = status ?? SUBSCRIPTION_STATUSES.PENDING;

    if (
      !Object.values(SUBSCRIPTION_STATUSES).includes(
        normalizedStatus as SubscriptionStatus,
      )
    ) {
      throw new BadRequestException("Unsupported subscription status");
    }

    return normalizedStatus as SubscriptionStatus;
  }

  private normalizeKey(key: string, label: string): string {
    const normalizedKey = key.trim().toLowerCase();

    if (normalizedKey.length === 0) {
      throw new BadRequestException(`${label} is required`);
    }

    return normalizedKey;
  }

  private normalizeId(id: string, label: string): string {
    const normalizedId = id.trim();

    if (normalizedId.length === 0) {
      throw new BadRequestException(`${label} is required`);
    }

    return normalizedId;
  }
}
