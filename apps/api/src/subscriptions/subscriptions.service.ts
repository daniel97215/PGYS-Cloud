import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Page,
  PaginationQueryDto,
} from "../common/dto/pagination-query.dto";
import { CancelSubscriptionDto } from "./dto/cancel-subscription.dto";
import { ChangeOfferDto } from "./dto/change-offer.dto";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { ReactivateSubscriptionDto } from "./dto/reactivate-subscription.dto";
import { OFFER_STATUSES } from "../offers/offers.constants";
import { PRICE_STATUSES } from "../pricing/pricing.constants";
import {
  SUBSCRIPTION_STATUSES,
  SubscriptionStatus,
} from "./subscriptions.constants";
import {
  SubscriptionOfferRecord,
  SubscriptionPriceRecord,
  SubscriptionRecord,
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
    const status = this.normalizeStatus(data.status);
    if (
      status !== SUBSCRIPTION_STATUSES.PENDING &&
      status !== SUBSCRIPTION_STATUSES.ACTIVE
    ) {
      throw new ConflictException(
        "Subscriptions can only be created as pending or active",
      );
    }
    const offer = await this.requireOffer(data.offerKey);
    this.requireOfferAvailable(offer);
    await this.requirePriceIfProvided(data.priceId, offer.id);
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
    pagination: PaginationQueryDto = {},
  ): Promise<Page<SubscriptionRecord>> {
    const workspace = await this.requireWorkspace(workspaceId);

    return this.subscriptionsRepository.findPageByWorkspace(
      workspace.id,
      pagination,
    );
  }

  async changeOffer(
    subscriptionId: string,
    data: ChangeOfferDto,
  ): Promise<SubscriptionRecord> {
    const subscription = await this.requireSubscription(subscriptionId);
    this.requireOfferChangeAllowed(subscription);
    const offer = await this.requireOffer(data.offerKey);
    this.requireOfferAvailable(offer);
    await this.requirePriceIfProvided(data.priceId, offer.id);
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
    if (subscription.status === SUBSCRIPTION_STATUSES.SUSPENDED) {
      return subscription;
    }
    if (subscription.status !== SUBSCRIPTION_STATUSES.ACTIVE) {
      throw this.invalidTransition(subscription.status, SUBSCRIPTION_STATUSES.SUSPENDED);
    }
    return this.applyTransition(
      subscription,
      SUBSCRIPTION_STATUSES.SUSPENDED,
    );
  }

  async reactivateSubscription(
    subscriptionId: string,
    data: ReactivateSubscriptionDto,
  ): Promise<SubscriptionRecord> {
    const subscription = await this.requireSubscription(subscriptionId);
    if (subscription.status === SUBSCRIPTION_STATUSES.ACTIVE) {
      return subscription;
    }
    if (
      subscription.status !== SUBSCRIPTION_STATUSES.PENDING &&
      subscription.status !== SUBSCRIPTION_STATUSES.SUSPENDED
    ) {
      throw this.invalidTransition(subscription.status, SUBSCRIPTION_STATUSES.ACTIVE);
    }
    await this.ensureNoActiveDuplicate(
      subscription.workspaceId,
      subscription.offerId,
      SUBSCRIPTION_STATUSES.ACTIVE,
      subscription.id,
    );

    return this.applyTransition(subscription, SUBSCRIPTION_STATUSES.ACTIVE, {
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
    if (subscription.status === SUBSCRIPTION_STATUSES.CANCELLED) {
      return subscription;
    }
    if (
      subscription.status !== SUBSCRIPTION_STATUSES.PENDING &&
      subscription.status !== SUBSCRIPTION_STATUSES.ACTIVE &&
      subscription.status !== SUBSCRIPTION_STATUSES.SUSPENDED
    ) {
      throw this.invalidTransition(
        subscription.status,
        SUBSCRIPTION_STATUSES.CANCELLED,
      );
    }
    const cancelledAt = data.cancelledAt ?? new Date();

    return this.applyTransition(subscription, SUBSCRIPTION_STATUSES.CANCELLED, {
      cancelledAt,
      endsAt: data.endsAt ?? cancelledAt,
    });
  }

  async expireSubscription(subscriptionId: string): Promise<SubscriptionRecord> {
    const subscription = await this.requireSubscription(subscriptionId);
    if (subscription.status === SUBSCRIPTION_STATUSES.EXPIRED) {
      return subscription;
    }
    if (
      subscription.status !== SUBSCRIPTION_STATUSES.PENDING &&
      subscription.status !== SUBSCRIPTION_STATUSES.ACTIVE &&
      subscription.status !== SUBSCRIPTION_STATUSES.SUSPENDED
    ) {
      throw this.invalidTransition(
        subscription.status,
        SUBSCRIPTION_STATUSES.EXPIRED,
      );
    }
    return this.applyTransition(subscription, SUBSCRIPTION_STATUSES.EXPIRED, {
      endsAt: new Date(),
    });
  }

  private requireOfferChangeAllowed(subscription: SubscriptionRecord): void {
    if (
      subscription.status !== SUBSCRIPTION_STATUSES.PENDING &&
      subscription.status !== SUBSCRIPTION_STATUSES.ACTIVE &&
      subscription.status !== SUBSCRIPTION_STATUSES.SUSPENDED
    ) {
      throw new ConflictException(
        `Offer cannot be changed on a ${subscription.status} subscription`,
      );
    }
  }

  private async applyTransition(
    subscription: SubscriptionRecord,
    target: SubscriptionStatus,
    data: Parameters<SubscriptionsRepository["transition"]>[3] = {},
  ): Promise<SubscriptionRecord> {
    const updated = await this.subscriptionsRepository.transition(
      subscription.id,
      subscription.status as SubscriptionStatus,
      target,
      data,
    );
    if (!updated) {
      throw new ConflictException("Subscription status changed concurrently");
    }
    return updated;
  }

  private invalidTransition(current: string, target: SubscriptionStatus) {
    return new ConflictException(
      `Subscription cannot transition from ${current} to ${target}`,
    );
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
    offerId?: string,
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
    const now = new Date();
    if (
      (offerId && price.offerId !== offerId) ||
      price.status !== PRICE_STATUSES.ACTIVE ||
      price.validFrom > now ||
      (price.validTo !== null && price.validTo <= now)
    ) {
      throw new ConflictException("Price is not available for this offer");
    }

    return price;
  }

  private requireOfferAvailable(offer: SubscriptionOfferRecord): void {
    if (offer.status !== OFFER_STATUSES.ACTIVE) {
      throw new ConflictException("Only an active offer can be subscribed");
    }
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
