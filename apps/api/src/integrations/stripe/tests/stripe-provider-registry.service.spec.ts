import { ServiceUnavailableException } from "@nestjs/common";
import { StripeProviderAdapter } from "../stripe-provider.contract";
import { StripeProviderRegistryService } from "../stripe-provider-registry.service";

describe("StripeProviderRegistryService", () => {
  const adapter: StripeProviderAdapter = {
    providerId: "STRIPE",
    createCheckoutSession: jest.fn(),
    verifyWebhook: jest.fn(),
  };

  it("returns the registered Stripe adapter", () => {
    expect(new StripeProviderRegistryService([adapter]).get()).toBe(adapter);
  });

  it("fails cleanly while no Stripe adapter is installed", () => {
    expect(() => new StripeProviderRegistryService([]).get()).toThrow(
      ServiceUnavailableException,
    );
  });
});
