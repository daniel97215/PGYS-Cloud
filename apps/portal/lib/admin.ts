import type { IconName } from "@pgys/ui";

export type AdminNavigationItem = {
  href: string;
  icon: IconName;
  isCurrent?: boolean;
  label: string;
};

export type AdminModule = {
  available: boolean;
  description: string;
  href: string;
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
    { label: "Vue d’ensemble", href: "/", icon: "home" },
    { label: "Workspaces", href: "/workspaces", icon: "apps" },
    { label: "Abonnements", href: "/#modules", icon: "ticket" },
    { label: "Journal d’audit", href: "/#modules", icon: "backup" },
  ] satisfies AdminNavigationItem[],
  modules: [
    {
      id: "workspaces",
      available: true,
      href: "/workspaces",
      title: "Workspaces",
      description:
        "Consulter les espaces clients et leur état depuis une vue opérateur dédiée.",
      icon: "apps",
    },
    {
      id: "subscriptions",
      available: false,
      href: "/#modules",
      title: "Abonnements",
      description:
        "Suivre les engagements commerciaux sans contourner leur cycle métier.",
      icon: "ticket",
    },
    {
      id: "audit",
      available: false,
      href: "/#modules",
      title: "Journal d’audit",
      description:
        "Examiner les actions sensibles dans un périmètre interne contrôlé.",
      icon: "backup",
    },
  ] satisfies AdminModule[],
} as const;
