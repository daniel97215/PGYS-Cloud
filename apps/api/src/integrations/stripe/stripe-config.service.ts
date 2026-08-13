import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { isURL } from "class-validator";

export interface StripeCheckoutConfiguration {
  successUrl: string;
  cancelUrl: string;
}

@Injectable()
export class StripeConfigService {
  constructor(private readonly config: ConfigService) {}

  getCheckoutConfiguration(): StripeCheckoutConfiguration {
    const successUrl = this.config
      .get<string>("STRIPE_CHECKOUT_SUCCESS_URL")
      ?.trim();
    const cancelUrl = this.config
      .get<string>("STRIPE_CHECKOUT_CANCEL_URL")
      ?.trim();

    if (!this.isHttpsUrl(successUrl) || !this.isHttpsUrl(cancelUrl)) {
      throw new ServiceUnavailableException(
        "Stripe Checkout is not configured",
      );
    }

    return { successUrl, cancelUrl };
  }

  private isHttpsUrl(value: string | undefined): value is string {
    return (
      value !== undefined &&
      value.length <= 2048 &&
      isURL(value, { protocols: ["https"], require_protocol: true }) &&
      value.toLowerCase().startsWith("https://")
    );
  }
}
