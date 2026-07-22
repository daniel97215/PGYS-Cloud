import type { IconName } from "@pgys/ui";

export type PortalNavigationItem = {
  href: string;
  icon: IconName;
  isCurrent?: boolean;
  label: string;
};

export type PortalService = {
  description: string;
  icon: IconName;
  id: "cloud" | "apps" | "status" | "api" | "website";
  status: "Disponible" | "À configurer";
  title: string;
  url: string;
};

export const portalMock = {
  customer: {
    firstName: "Admin",
    initials: "PG",
    organization: "Administration PROGYS",
  },
  navigation: [
    { label: "Accueil", href: "/", icon: "home", isCurrent: true },
    { label: "Services", href: "/#services", icon: "apps" },
    { label: "Paramètres", href: "/#settings", icon: "settings" },
  ] satisfies PortalNavigationItem[],
  services: [
    {
      id: "cloud",
      title: "PROGYS Cloud",
      description: "Accéder aux fichiers, partages et espaces collaboratifs.",
      status: "Disponible",
      icon: "cloud",
      url: "https://cloud.pgys.fr",
    },
    {
      id: "apps",
      title: "Applications métier",
      description: "Ouvrir le catalogue des applications et outils PROGYS.",
      status: "À configurer",
      icon: "apps",
      url: "https://apps.pgys.fr",
    },
    {
      id: "status",
      title: "État des services",
      description: "Consulter la disponibilité des services et infrastructures.",
      status: "Disponible",
      icon: "hosting",
      url: "https://status.pgys.fr",
    },
    {
      id: "api",
      title: "API PROGYS",
      description: "Accéder au point d’entrée de la plateforme API.",
      status: "À configurer",
      icon: "settings",
      url: "https://api.pgys.fr",
    },
    {
      id: "website",
      title: "Site public",
      description: "Revenir sur le site institutionnel PROGYS.",
      status: "Disponible",
      icon: "hosting",
      url: "https://pgys.fr",
    },
  ] satisfies PortalService[],
} as const;
