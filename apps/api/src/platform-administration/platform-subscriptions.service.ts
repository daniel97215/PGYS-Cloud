import { Injectable, NotFoundException } from "@nestjs/common";
import { PlatformOperatorRole } from "@prisma/client";
import {
  PlatformSubscriptionPageResponseDto,
  PlatformSubscriptionResponseDto,
} from "./dto/platform-subscription-response.dto";
import { SearchPlatformSubscriptionsDto } from "./dto/search-platform-subscriptions.dto";
import {
  PlatformSubscriptionRecord,
  PlatformSubscriptionsRepository,
} from "./platform-subscriptions.repository";

@Injectable()
export class PlatformSubscriptionsService {
  constructor(private readonly repository: PlatformSubscriptionsRepository) {}

  async search(
    criteria: SearchPlatformSubscriptionsDto,
    accessRole: PlatformOperatorRole,
  ): Promise<PlatformSubscriptionPageResponseDto> {
    const result = await this.repository.search(criteria);

    return {
      items: result.items.map((item) => this.toView(item)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      accessRole,
    };
  }

  async getOne(id: string): Promise<PlatformSubscriptionResponseDto> {
    const subscription = await this.repository.findById(id);

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    return this.toView(subscription);
  }

  private toView(
    subscription: PlatformSubscriptionRecord,
  ): PlatformSubscriptionResponseDto {
    return {
      id: subscription.id,
      status: subscription.status,
      workspace: subscription.workspace,
      offer: subscription.offer,
      price: subscription.price
        ? {
            ...subscription.price,
            amount: subscription.price.amount.toFixed(2),
          }
        : null,
      startedAt: subscription.startedAt,
      endsAt: subscription.endsAt,
      cancelledAt: subscription.cancelledAt,
      renewalDate: subscription.renewalDate,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
