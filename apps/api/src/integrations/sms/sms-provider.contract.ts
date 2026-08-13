import { SmsDeliveryStatus } from "./sms.constants";

export interface SendTransactionalSmsRequest {
  workspaceId: string;
  idempotencyKey: string;
  to: string;
  text: string;
}

export interface SendTransactionalSmsResponse {
  status: SmsDeliveryStatus;
  provider: string;
  externalReference?: string;
}

export interface SmsProviderSendRequest extends SendTransactionalSmsRequest {
  from?: string;
}

export interface SmsProviderSendResponse {
  status: SmsDeliveryStatus;
  externalReference?: string;
}

export interface SmsProviderAdapter {
  readonly providerId: string;

  send(request: SmsProviderSendRequest): Promise<SmsProviderSendResponse>;
}
