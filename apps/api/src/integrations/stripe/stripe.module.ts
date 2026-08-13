import { Module } from "@nestjs/common";
import { STRIPE_PROVIDER_ADAPTERS } from "./stripe.constants";
import { StripeCheckoutPreparationService } from "./stripe-checkout-preparation.service";
import { StripeConfigService } from "./stripe-config.service";
import { StripeProviderRegistryService } from "./stripe-provider-registry.service";
import { StripeWebhookPreparationService } from "./stripe-webhook-preparation.service";

@Module({
  providers: [
    { provide: STRIPE_PROVIDER_ADAPTERS, useValue: [] },
    StripeConfigService,
    StripeProviderRegistryService,
    StripeCheckoutPreparationService,
    StripeWebhookPreparationService,
  ],
  exports: [
    StripeCheckoutPreparationService,
    StripeWebhookPreparationService,
  ],
})
export class StripeModule {}
