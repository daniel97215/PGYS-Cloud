export const FEATURE_STATUSES = {
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type FeatureStatus =
  (typeof FEATURE_STATUSES)[keyof typeof FEATURE_STATUSES];

export const FEATURE_STATUS_ARCHIVED = FEATURE_STATUSES.ARCHIVED;
