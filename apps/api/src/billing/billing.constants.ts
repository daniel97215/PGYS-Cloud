export const BILLING_PERIODS = {
  MONTHLY: "MONTHLY",
  ANNUAL: "ANNUAL",
} as const;

export type BillingPeriod =
  (typeof BILLING_PERIODS)[keyof typeof BILLING_PERIODS];

export const BILLING_INVOICE_STATUSES = {
  DRAFT: "DRAFT",
  OPEN: "OPEN",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  VOID: "VOID",
} as const;

export type BillingInvoiceStatus =
  (typeof BILLING_INVOICE_STATUSES)[keyof typeof BILLING_INVOICE_STATUSES];

export const BILLING_STATUS_LABELS = {
  [BILLING_INVOICE_STATUSES.DRAFT]: { en: "Draft", fr: "Brouillon" },
  [BILLING_INVOICE_STATUSES.OPEN]: { en: "Open", fr: "Émise" },
  [BILLING_INVOICE_STATUSES.PAID]: { en: "Paid", fr: "Payée" },
  [BILLING_INVOICE_STATUSES.OVERDUE]: { en: "Overdue", fr: "En retard" },
  [BILLING_INVOICE_STATUSES.VOID]: { en: "Void", fr: "Annulée" },
} as const;

export const BILLING_PERIOD_LABELS = {
  [BILLING_PERIODS.MONTHLY]: { en: "Monthly", fr: "Mensuelle" },
  [BILLING_PERIODS.ANNUAL]: { en: "Annual", fr: "Annuelle" },
} as const;
