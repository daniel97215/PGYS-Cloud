import { BadRequestException } from "@nestjs/common";
import {
  STRIPE_API_VERSION,
  STRIPE_CHECKOUT_STATUS,
} from "../stripe.constants";
import { StripeProviderAdapter } from "../stripe-provider.contract";
import { StripeCheckoutPreparationService } from "../stripe-checkout-preparation.service";
import { StripeConfigService } from "../stripe-config.service";
import { StripeProviderRegistryService } from "../stripe-provider-registry.service";

describe("StripeCheckoutPreparationService", () => {
  let adapter: jest.Mocked<StripeProviderAdapter>;
  let service: StripeCheckoutPreparationService;

  beforeEach(() => {
    adapter = {
      providerId: "STRIPE",
      createCheckoutSession: jest.fn().mockResolvedValue({
        externalSessionId: "cs_test_a",
        checkoutUrl: "https://checkout.stripe.com/c/pay/cs_test_a",
        status: STRIPE_CHECKOUT_STATUS.OPEN,
        expiresAt: new Date("2026-08-14T12:30:00.000Z"),
      }),
      verifyWebhook: jest.fn(),
    };
    const config = {
      getCheckoutConfiguration: jest.fn().mockReturnValue({
        successUrl: "https://portal.pgys.fr/payment/success",
        cancelUrl: "https://portal.pgys.fr/payment/cancel",
      }),
    } as unknown as StripeConfigService;
    const registry = {
      get: jest.fn().mockReturnValue(adapter),
    } as unknown as StripeProviderRegistryService;
    service = new StripeCheckoutPreparationService(config, registry);
  });

  it("prepares a hosted payment Checkout Session with PGYS invoice metadata", async () => {
    const result = await service.createSession({
      workspaceId: " workspace-a ",
      invoiceId: " invoice-a ",
      invoiceNumber: " INV-000001 ",
      idempotencyKey: " invoice-a-checkout ",
      amountMinor: 10800,
      currency: " eur ",
    });

    expect(adapter.createCheckoutSession).toHaveBeenCalledWith({
      workspaceId: "workspace-a",
      invoiceId: "invoice-a",
      invoiceNumber: "INV-000001",
      idempotencyKey: "invoice-a-checkout",
      amountMinor: 10800,
      currency: "EUR",
      mode: "payment",
      successUrl: "https://portal.pgys.fr/payment/success",
      cancelUrl: "https://portal.pgys.fr/payment/cancel",
      apiVersion: STRIPE_API_VERSION,
      metadata: {
        workspaceId: "workspace-a",
        invoiceId: "invoice-a",
        invoiceNumber: "INV-000001",
      },
    });
    expect(result).toEqual(
      expect.objectContaining({
        provider: "STRIPE",
        externalSessionId: "cs_test_a",
        status: STRIPE_CHECKOUT_STATUS.OPEN,
      }),
    );
  });

  it.each([
    ["Workspace", { workspaceId: " " }],
    ["invoice", { invoiceId: " " }],
    ["invoice number", { invoiceNumber: " " }],
    ["idempotency key", { idempotencyKey: " " }],
    ["amount", { amountMinor: 0 }],
    ["fractional amount", { amountMinor: 100.5 }],
    ["currency", { currency: "EURO" }],
  ])("rejects an invalid %s", async (_label, override) => {
    await expect(
      service.createSession({
        workspaceId: "workspace-a",
        invoiceId: "invoice-a",
        invoiceNumber: "INV-000001",
        idempotencyKey: "invoice-a-checkout",
        amountMinor: 10800,
        currency: "EUR",
        ...override,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(adapter.createCheckoutSession).not.toHaveBeenCalled();
  });
});
