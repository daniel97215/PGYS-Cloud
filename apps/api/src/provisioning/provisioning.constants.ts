export const PROVISIONING_JOB_STATUSES = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const PROVISIONING_OPERATIONS = {
  PROVISION: "provision",
  REPROVISION: "reprovision",
  DEPROVISION: "deprovision",
} as const;

export type ProvisioningOperation =
  (typeof PROVISIONING_OPERATIONS)[keyof typeof PROVISIONING_OPERATIONS];

export type ProvisioningJobStatus =
  (typeof PROVISIONING_JOB_STATUSES)[keyof typeof PROVISIONING_JOB_STATUSES];

export const PROVISIONING_JOB_STATUS = PROVISIONING_JOB_STATUSES;
export const PROVISIONING_OPERATION = PROVISIONING_OPERATIONS;
