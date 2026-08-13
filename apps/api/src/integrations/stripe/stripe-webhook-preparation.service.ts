import { BadRequestException, Injectable } from "@nestjs/common";
import { STRIPE_WEBHOOK_EVENT } from "./stripe.constants";
import {
  StripeWebhookVerificationRequest,
  VerifiedStripeWebhookEvent,
} from "./stripe-provider.contract";
import { StripeProviderRegistryService } from "./stripe-provider-registry.service";

@Injectable()
export class StripeWebhookPreparationService {
  constructor(private readonly providerRegistry: StripeProviderRegistryService) {}

  async verify(
    request: StripeWebhookVerificationRequest,
  ): Promise<VerifiedStripeWebhookEvent> {
    if (!request.signature.trim()) {
      throw new BadRequestException("Stripe webhook signature is required");
    }

    const event = await this.providerRegistry.get().verifyWebhook(request);
    if (!Object.values(STRIPE_WEBHOOK_EVENT).includes(event.type)) {
      throw new BadRequestException("Stripe webhook event is not supported");
    }
    if (
      !event.eventId.trim() ||
      !event.externalSessionId.trim() ||
      !event.workspaceId.trim() ||
      !event.invoiceId.trim()
    ) {
      throw new BadRequestException("Stripe webhook metadata is incomplete");
    }

    return event;
  }
}
