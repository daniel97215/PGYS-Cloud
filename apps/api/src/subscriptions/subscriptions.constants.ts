export const SUBSCRIPTION_STATUSES = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUSES)[keyof typeof SUBSCRIPTION_STATUSES];
