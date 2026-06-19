import type { IconName } from "@pgys/ui";

export type PortalNavigationItem = {
  href: string;
  icon: IconName;
  isCurrent?: boolean;
  label: string;
};

export type PortalService = {
  description: string;
  detail: string;
  icon: IconName;
  id: "cloud" | "apps" | "hosting" | "backup";
  status: "Actif" | "Disponible" | "Protégé";
  title: string;
};

export const portalMock = {
  customer: {
    firstName: "Daniel",
    initials: "DB",
    organization: "Entreprise de démonstration",
  },
  navigation: [
    { label: "Tableau de bord", href: "/", icon: "home", isCurrent: true },
    { label: "Cloud", href: "/#services", icon: "cloud" },
    { label: "Applications", href: "/#services", icon: "apps" },
    { label: "Hébergement", href: "/#services", icon: "hosting" },
    { label: "Sauvegardes", href: "/#services", icon: "backup" },
    { label: "Support", href: "/#support", icon: "ticket" },
    { label: "Paramètres", href: "/#settings", icon: "settings" },
  ] satisfies PortalNavigationItem[],
  services: [
    {
      id: "cloud",
      title: "PGYS Cloud",
      description: "Vos fichiers professionnels, accessibles et partagés.",
      detail: "Espace de démonstration",
      status: "Actif",
      icon: "cloud",
    },
    {
      id: "apps",
      title: "Applications",
      description: "Vos outils métier réunis dans un espace unique.",
      detail: "Catalogue disponible",
      status: "Disponible",
      icon: "apps",
    },
    {
      id: "hosting",
      title: "Hébergement",
      description: "Suivez les services hébergés et leur disponibilité.",
      detail: "Services supervisés",
      status: "Actif",
      icon: "hosting",
    },
    {
      id: "backup",
      title: "Sauvegardes",
      description: "Gardez une vue claire sur la protection de vos données.",
      detail: "Protection configurée",
      status: "Protégé",
      icon: "backup",
    },
  ] satisfies PortalService[],
  activities: {
    title: "Aucune activité récente",
    description:
      "Les opérations réalisées sur vos services apparaîtront ici.",
  },
  alerts: {
    title: "Tout fonctionne normalement",
    description: "Aucune alerte ne nécessite votre attention pour le moment.",
  },
  support: {
    title: "Besoin d’aide ?",
    description:
      "L’équipe PGYS vous accompagne pour vos services et vos projets numériques.",
    action: {
      label: "Ouvrir un ticket",
      href: "mailto:support@pgys.fr?subject=Demande%20de%20support%20PGYS",
    },
  },
} as const;
