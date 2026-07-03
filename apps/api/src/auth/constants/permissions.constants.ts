export const PERMISSIONS = {
  WORKSPACE_READ: "workspace.read",
  WORKSPACE_WRITE: "workspace.write",
  CUSTOMERS_READ: "customers.read",
  CUSTOMERS_WRITE: "customers.write",
  OFFERS_READ: "offers.read",
  OFFERS_WRITE: "offers.write",
  PRICING_READ: "pricing.read",
  PRICING_WRITE: "pricing.write",
  SUBSCRIPTIONS_READ: "subscriptions.read",
  SUBSCRIPTIONS_WRITE: "subscriptions.write",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

