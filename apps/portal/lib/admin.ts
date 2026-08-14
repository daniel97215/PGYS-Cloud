import type { IconName } from "@pgys/ui";

export type AdminNavigationItem = {
  href: string;
  icon: IconName;
  isCurrent?: boolean;
  label: string;
};

export type AdminModule = {
  description: string;
  icon: IconName;
  id: "workspaces" | "subscriptions" | "audit";
  title: string;
};

export const adminPortal = {
  operator: {
    firstName: "Opérateur PGYS",
    initials: "PG",
    organization: "Administration interne",
  },
  navigation: [
    { label: "Vue d’ensemble", href: "/", icon: "home", isCurrent: true },
    { label: "Workspaces", href: "/#modules", icon: "apps" },
    { label: "Abonnements", href: "/#modules", icon: "ticket" },
    { label: "Journal d’audit", href: "/#modules", icon: "backup" },
  ] satisfies AdminNavigationItem[],
  modules: [
    {
      id: "workspaces",
      title: "Workspaces",
      description:
        "Consulter les espaces clients et leur état depuis une vue opérateur dédiée.",
      icon: "apps",
    },
    {
      id: "subscriptions",
      title: "Abonnements",
      description:
        "Suivre les engagements commerciaux sans contourner leur cycle métier.",
      icon: "ticket",
    },
    {
      id: "audit",
      title: "Journal d’audit",
      description:
        "Examiner les actions sensibles dans un périmètre interne contrôlé.",
      icon: "backup",
    },
  ] satisfies AdminModule[],
} as const;
