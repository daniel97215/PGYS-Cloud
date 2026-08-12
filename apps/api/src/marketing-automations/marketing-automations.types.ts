export const MARKETING_AUTOMATION_STATUSES = ["DRAFT", "ACTIVE", "INACTIVE"] as const;
export type MarketingAutomationStatus = (typeof MARKETING_AUTOMATION_STATUSES)[number];

export const MARKETING_AUTOMATION_TRIGGERS = [
  "BUSINESS_PARTNER_CREATED",
  "TAG_ASSIGNED",
  "CATEGORY_ASSIGNED",
  "ROLE_ASSIGNED",
] as const;
export type MarketingAutomationTrigger = (typeof MARKETING_AUTOMATION_TRIGGERS)[number];

export const MARKETING_AUTOMATION_ACTIONS = ["ENROLL_IN_CAMPAIGN"] as const;
export type MarketingAutomationAction = (typeof MARKETING_AUTOMATION_ACTIONS)[number];
