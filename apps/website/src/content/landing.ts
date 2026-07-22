export type Link = { label: string; href: string };

export type Service = {
  name: string;
  tagline: string;
  description: string;
  icon: "cloud" | "apps" | "hosting" | "settings" | "backup";
};

export type CloudPlan = {
  name: string;
  storage: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
};

export const landingContent = {
  header: {
    links: [
      { label: "Services", href: "#services" },
      { label: "Solutions", href: "#solutions" },
      { label: "Tarifs", href: "#tarifs" },
      { label: "Contact", href: "#contact" },
    ] satisfies Link[],
    cta: { label: "Espace client", href: "https://admin.pgys.fr" },
  },
  hero: {
    title: "Votre informatique, simplement maîtrisée.",
    description:
      "PROGYS accompagne les TPE, PME et associations avec des solutions fiables et évolutives : cloud privé, applications métier, hébergement, maintenance et sauvegardes.",
    primaryCta: { label: "Parler de votre projet", href: "#contact" },
    secondaryCta: { label: "Découvrir nos services", href: "#services" },
  },
  services: {
    title: "Un partenaire unique pour votre informatique",
    description:
      "Des services complémentaires, conçus pour réduire la complexité technique et vous laisser concentré sur votre activité.",
    items: [
      {
        name: "Cloud privé",
        tagline: "Vos fichiers accessibles et protégés",
        description:
          "Un espace professionnel hébergé en France pour stocker, synchroniser et partager vos documents.",
        icon: "cloud",
      },
      {
        name: "Applications métier",
        tagline: "Des outils adaptés à vos processus",
        description:
          "Des applications simples et maintenables qui remplacent les tableaux dispersés et les tâches répétitives.",
        icon: "apps",
      },
      {
        name: "Hébergement",
        tagline: "Vos services en ligne, sans la charge technique",
        description:
          "Hébergement, supervision et mises à jour de vos sites, applications et bases de données.",
        icon: "hosting",
      },
      {
        name: "Maintenance",
        tagline: "Une informatique suivie dans le temps",
        description:
          "Support, mises à jour et accompagnement pour assurer la continuité de votre activité.",
        icon: "settings",
      },
      {
        name: "Sauvegardes",
        tagline: "Vos données restent récupérables",
        description:
          "Des sauvegardes chiffrées, externalisées et contrôlées pour protéger les informations essentielles.",
        icon: "backup",
      },
    ] satisfies Service[],
  },
  values: [
    { title: "Sécurité", description: "Des données protégées selon les meilleures pratiques." },
    { title: "Fiabilité", description: "Des infrastructures robustes et réellement supervisées." },
    { title: "Proximité", description: "Un interlocuteur humain qui connaît votre contexte." },
    { title: "Évolutivité", description: "Des solutions qui grandissent avec votre entreprise." },
  ],
  pricing: {
    title: "Des offres cloud simples et transparentes",
    description:
      "Choisissez une base adaptée à votre équipe. Nous validons ensemble la configuration avant toute mise en service.",
    plans: [
      {
        name: "Essentiel",
        storage: "100 Go",
        price: "5,99 € / mois",
        description: "Pour démarrer avec un espace professionnel individuel.",
        features: ["1 utilisateur", "Partage sécurisé", "Support email"],
      },
      {
        name: "Pro",
        storage: "500 Go",
        price: "11,99 € / mois",
        description: "Pour partager les documents d’une petite équipe.",
        features: ["Jusqu’à 5 utilisateurs", "Multi-appareils", "Support prioritaire"],
        featured: true,
      },
      {
        name: "Business",
        storage: "2 To",
        price: "24,99 € / mois",
        description: "Pour une structure en croissance et ses données critiques.",
        features: ["Jusqu’à 15 utilisateurs", "Accompagnement initial", "Support prioritaire"],
      },
    ] satisfies CloudPlan[],
  },
};
