export const OFFER_STATUSES = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type OfferStatus =
  (typeof OFFER_STATUSES)[keyof typeof OFFER_STATUSES];

export const OFFER_STATUS_ARCHIVED = OFFER_STATUSES.ARCHIVED;
