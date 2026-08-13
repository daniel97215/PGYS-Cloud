export const CHECKOUT_STATUSES = {
  OPEN: "OPEN",
  COMPLETED: "COMPLETED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;

export type CheckoutStatus =
  (typeof CHECKOUT_STATUSES)[keyof typeof CHECKOUT_STATUSES];

export const CHECKOUT_BILLING_PERIODS = {
  MONTHLY: "MONTHLY",
  ANNUAL: "ANNUAL",
} as const;

export type CheckoutBillingPeriod =
  (typeof CHECKOUT_BILLING_PERIODS)[keyof typeof CHECKOUT_BILLING_PERIODS];
