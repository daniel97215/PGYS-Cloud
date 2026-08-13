export const EMAIL_DELIVERY_STATUS = {
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  FAILED: "FAILED",
} as const;

export type EmailDeliveryStatus =
  (typeof EMAIL_DELIVERY_STATUS)[keyof typeof EMAIL_DELIVERY_STATUS];

export const EMAIL_PROVIDER_ADAPTERS = Symbol("EMAIL_PROVIDER_ADAPTERS");
