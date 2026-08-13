import { BadRequestException } from "@nestjs/common";
import { STRIPE_WEBHOOK_EVENT } from "../stripe.constants";
import { StripeProviderAdapter } from "../stripe-provider.contract";
import { StripeProviderRegistryService } from "../stripe-provider-registry.service";
import { StripeWebhookPreparationService } from "../stripe-webhook-preparation.service";

describe("StripeWebhookPreparationService", () => {
  const event = {
    eventId: "evt_a",
    type: STRIPE_WEBHOOK_EVENT.CHECKOUT_SESSION_COMPLETED,
    occurredAt: new Date("2026-08-14T12:00:00.000Z"),
    externalSessionId: "cs_test_a",
    workspaceId: "workspace-a",
    invoiceId: "invoice-a",
    paymentReference: "pi_a",
  };
  let adapter: jest.Mocked<StripeProviderAdapter>;
  let service: StripeWebhookPreparationService;

  beforeEach(() => {
    adapter = {
      providerId: "STRIPE",
      createCheckoutSession: jest.fn(),
      verifyWebhook: jest.fn().mockResolvedValue(event),
    };
    const registry = {
      get: jest.fn().mockReturnValue(adapter),
    } as unknown as StripeProviderRegistryService;
    service = new StripeWebhookPreparationService(registry);
  });

  it("delegates signature verification and returns normalized metadata", async () => {
    const payload = Buffer.from("raw payload");

    await expect(
      service.verify({ payload, signature: "signature-a" }),
    ).resolves.toEqual(event);
    expect(adapter.verifyWebhook).toHaveBeenCalledWith({
      payload,
      signature: "signature-a",
    });
  });

  it("rejects missing signatures before parsing payloads", async () => {
    await expect(
      service.verify({ payload: "payload", signature: " " }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(adapter.verifyWebhook).not.toHaveBeenCalled();
  });

  it("rejects incomplete verified metadata", async () => {
    adapter.verifyWebhook.mockResolvedValueOnce({
      ...event,
      invoiceId: " ",
    });

    await expect(
      service.verify({ payload: "payload", signature: "signature-a" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
