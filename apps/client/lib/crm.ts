export const CRM_ACTIVITY_TYPES = [
  "CALL",
  "EMAIL",
  "MEETING",
  "TASK",
  "NOTE",
] as const;

export type CrmActivityType = (typeof CRM_ACTIVITY_TYPES)[number];
export type CrmActivityStatus = "PLANNED" | "COMPLETED" | "CANCELLED";

export interface BusinessPartnerContact {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  isPrimary: boolean;
  isActive: boolean;
}

export interface BusinessPartner {
  id: string;
  code: string;
  type: string;
  name: string;
  legalName: string | null;
  status: string;
  notes: string | null;
  contacts?: BusinessPartnerContact[];
}

export interface CrmActivity {
  id: string;
  businessPartnerId: string;
  contactId: string | null;
  type: CrmActivityType;
  status: CrmActivityStatus;
  title: string;
  description: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface BusinessPartnerSearchResult {
  items: BusinessPartner[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BusinessPartnerDetailResult {
  partner: BusinessPartner;
  contacts: BusinessPartnerContact[];
  activities: CrmActivity[];
}

export const activityTypeLabels: Record<CrmActivityType, string> = {
  CALL: "Appel",
  EMAIL: "E-mail",
  MEETING: "Rendez-vous",
  TASK: "Tâche",
  NOTE: "Note",
};

export const activityStatusLabels: Record<CrmActivityStatus, string> = {
  PLANNED: "Planifiée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export const partnerTypeLabels: Record<string, string> = {
  customer: "Client",
  prospect: "Prospect",
  supplier: "Fournisseur",
  partner: "Partenaire",
};
