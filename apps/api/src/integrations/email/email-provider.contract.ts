import { EmailDeliveryStatus } from "./email.constants";

export interface SendTransactionalEmailRequest {
  workspaceId: string;
  idempotencyKey: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface SendTransactionalEmailResponse {
  status: EmailDeliveryStatus;
  provider: string;
  externalReference?: string;
}

export interface EmailSender {
  address: string;
  name?: string;
}

export interface EmailProviderSendRequest
  extends SendTransactionalEmailRequest {
  from: EmailSender;
}

export interface EmailProviderSendResponse {
  status: EmailDeliveryStatus;
  externalReference?: string;
}

export interface EmailProviderAdapter {
  readonly providerId: string;

  send(
    request: EmailProviderSendRequest,
  ): Promise<EmailProviderSendResponse>;
}
