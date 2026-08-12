export const PRICE_STATUSES = {
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type PriceStatus =
  (typeof PRICE_STATUSES)[keyof typeof PRICE_STATUSES];

export const PRICE_STATUS_ACTIVE = PRICE_STATUSES.ACTIVE;
export const PRICE_STATUS_ARCHIVED = PRICE_STATUSES.ARCHIVED;
