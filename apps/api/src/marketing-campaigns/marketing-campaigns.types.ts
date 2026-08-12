export const MARKETING_CHANNELS = ["EMAIL", "SMS"] as const;
export type MarketingChannel = (typeof MARKETING_CHANNELS)[number];

export const MARKETING_CAMPAIGN_STATUSES = [
  "DRAFT",
  "READY",
  "CANCELLED",
] as const;
export type MarketingCampaignStatus =
  (typeof MARKETING_CAMPAIGN_STATUSES)[number];
