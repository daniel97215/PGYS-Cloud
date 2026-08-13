import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { STRIPE_PROVIDER_ADAPTERS } from "./stripe.constants";
import { StripeProviderAdapter } from "./stripe-provider.contract";

@Injectable()
export class StripeProviderRegistryService {
  constructor(
    @Inject(STRIPE_PROVIDER_ADAPTERS)
    private readonly adapters: readonly StripeProviderAdapter[],
  ) {}

  get(): StripeProviderAdapter {
    const adapter = this.adapters.find(
      (candidate) => candidate.providerId === "STRIPE",
    );

    if (!adapter) {
      throw new ServiceUnavailableException("Stripe provider is unavailable");
    }
    return adapter;
  }
}
