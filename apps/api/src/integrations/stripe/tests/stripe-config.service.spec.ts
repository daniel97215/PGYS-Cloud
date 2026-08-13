import { ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StripeConfigService } from "../stripe-config.service";

describe("StripeConfigService", () => {
  const createService = (values: Record<string, string | undefined>) =>
    new StripeConfigService({
      get: jest.fn((name: string) => values[name]),
    } as unknown as ConfigService);

  it("loads HTTPS Checkout return URLs", () => {
    const service = createService({
      STRIPE_CHECKOUT_SUCCESS_URL: " https://portal.pgys.fr/payment/success ",
      STRIPE_CHECKOUT_CANCEL_URL: " https://portal.pgys.fr/payment/cancel ",
    });

    expect(service.getCheckoutConfiguration()).toEqual({
      successUrl: "https://portal.pgys.fr/payment/success",
      cancelUrl: "https://portal.pgys.fr/payment/cancel",
    });
  });

  it("rejects missing or non-HTTPS Checkout URLs", () => {
    expect(() => createService({}).getCheckoutConfiguration()).toThrow(
      ServiceUnavailableException,
    );
    expect(() =>
      createService({
        STRIPE_CHECKOUT_SUCCESS_URL: "http://portal.pgys.fr/success",
        STRIPE_CHECKOUT_CANCEL_URL: "https://portal.pgys.fr/cancel",
      }).getCheckoutConfiguration(),
    ).toThrow(ServiceUnavailableException);
  });
});
