import { BadRequestException, Injectable } from "@nestjs/common";
import {
  STRIPE_API_VERSION,
  STRIPE_CHECKOUT_MODE,
} from "./stripe.constants";
import {
  CreateStripeCheckoutRequest,
  StripeCheckoutSessionResponse,
} from "./stripe-provider.contract";
import { StripeConfigService } from "./stripe-config.service";
import { StripeProviderRegistryService } from "./stripe-provider-registry.service";

@Injectable()
export class StripeCheckoutPreparationService {
  constructor(
    private readonly stripeConfig: StripeConfigService,
    private readonly providerRegistry: StripeProviderRegistryService,
  ) {}

  async createSession(
    request: CreateStripeCheckoutRequest,
  ): Promise<StripeCheckoutSessionResponse> {
    const normalized = this.normalizeRequest(request);
    const configuration = this.stripeConfig.getCheckoutConfiguration();
    const adapter = this.providerRegistry.get();
    const response = await adapter.createCheckoutSession({
      ...normalized,
      mode: STRIPE_CHECKOUT_MODE.PAYMENT,
      successUrl: configuration.successUrl,
      cancelUrl: configuration.cancelUrl,
      apiVersion: STRIPE_API_VERSION,
      metadata: {
        workspaceId: normalized.workspaceId,
        invoiceId: normalized.invoiceId,
        invoiceNumber: normalized.invoiceNumber,
      },
    });

    return { ...response, provider: "STRIPE" };
  }

  private normalizeRequest(
    request: CreateStripeCheckoutRequest,
  ): CreateStripeCheckoutRequest {
    if (!Number.isSafeInteger(request.amountMinor) || request.amountMinor <= 0) {
      throw new BadRequestException(
        "Stripe Checkout amount must be a positive minor-unit integer",
      );
    }

    const currency = request.currency.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new BadRequestException("Stripe Checkout currency is invalid");
    }

    return {
      workspaceId: this.required(request.workspaceId, "Workspace id", 120),
      invoiceId: this.required(request.invoiceId, "Invoice id", 120),
      invoiceNumber: this.required(
        request.invoiceNumber,
        "Invoice number",
        80,
      ),
      idempotencyKey: this.required(
        request.idempotencyKey,
        "Stripe idempotency key",
        120,
      ),
      amountMinor: request.amountMinor,
      currency,
    };
  }

  private required(value: string, label: string, maxLength: number): string {
    const normalized = value.trim();
    if (!normalized || normalized.length > maxLength) {
      throw new BadRequestException(`${label} is invalid`);
    }
    return normalized;
  }
}
