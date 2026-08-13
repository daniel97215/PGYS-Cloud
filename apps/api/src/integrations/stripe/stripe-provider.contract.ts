import {
  StripeCheckoutStatus,
  StripeWebhookEventType,
} from "./stripe.constants";

export interface CreateStripeCheckoutRequest {
  workspaceId: string;
  invoiceId: string;
  invoiceNumber: string;
  idempotencyKey: string;
  amountMinor: number;
  currency: string;
}

export interface StripeCheckoutProviderRequest
  extends CreateStripeCheckoutRequest {
  mode: "payment";
  successUrl: string;
  cancelUrl: string;
  apiVersion: string;
  metadata: {
    workspaceId: string;
    invoiceId: string;
    invoiceNumber: string;
  };
}

export interface StripeCheckoutSessionResponse {
  provider: "STRIPE";
  externalSessionId: string;
  checkoutUrl: string;
  status: StripeCheckoutStatus;
  expiresAt: Date;
}

export interface StripeCheckoutProviderResponse {
  externalSessionId: string;
  checkoutUrl: string;
  status: StripeCheckoutStatus;
  expiresAt: Date;
}

export interface StripeWebhookVerificationRequest {
  payload: string | Buffer;
  signature: string;
}

export interface VerifiedStripeWebhookEvent {
  eventId: string;
  type: StripeWebhookEventType;
  occurredAt: Date;
  externalSessionId: string;
  workspaceId: string;
  invoiceId: string;
  paymentReference?: string;
}

export interface StripeProviderAdapter {
  readonly providerId: "STRIPE";

  createCheckoutSession(
    request: StripeCheckoutProviderRequest,
  ): Promise<StripeCheckoutProviderResponse>;

  verifyWebhook(
    request: StripeWebhookVerificationRequest,
  ): Promise<VerifiedStripeWebhookEvent>;
}

export interface StripeCheckoutSessionStore {
  findReusableOrReserve(
    request: CreateStripeCheckoutRequest,
  ): Promise<StripeCheckoutSessionResponse | null>;
}

export interface StripeWebhookEventDeduplicator {
  claim(eventId: string): Promise<boolean>;
}
