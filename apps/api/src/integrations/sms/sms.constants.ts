export const SMS_DELIVERY_STATUS = {
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  FAILED: "FAILED",
} as const;

export type SmsDeliveryStatus =
  (typeof SMS_DELIVERY_STATUS)[keyof typeof SMS_DELIVERY_STATUS];

export const SMS_PROVIDER_ADAPTERS = Symbol("SMS_PROVIDER_ADAPTERS");
