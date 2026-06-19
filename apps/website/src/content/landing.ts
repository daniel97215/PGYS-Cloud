export type Link = {
  label: string;
  href: string;
};

export type ServiceIconName = "cloud" | "apps" | "hosting" | "backup";

export type Service = {
  name: string;
  tagline: string;
  description: string;
  icon: ServiceIconName;
  features: string[];
};

export type CloudPlan = {
  name: string;
  storage: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: Link;
  featured?: boolean;
  badge?: string;
};

const services: Service[] = [
  {
    name: "PGYS Cloud",
    tagline: "Vos fichiers, partout et en sécurité.",
    description:
      "Stockez, synchronisez et partagez les documents de votre équipe dans un espace professionnel.",
    icon: "cloud",
    features: ["Accès multi-appareils", "Partage sécurisé", "Gestion des utilisateurs"],
  },
  {
    name: "Applications métier",
    tagline: "Un outil qui suit vraiment votre métier.",
    description:
      "Remplacez les tableaux dispersés et les tâches répétitives par une application adaptée à votre activité.",
    icon: "apps",
    features: ["Conception sur mesure", "Interfaces simples", "Maintenance incluse"],
  },
  {
    name: "Hébergement",
    tagline: "Votre service en ligne, sans la charge technique.",
    description:
      "Confiez-nous l’hébergement, la supervision et la maintenance de vos sites et applications.",
    icon: "hosting",
    features: ["Hébergement en France", "Suivi de disponibilité", "Mises à jour maîtrisées"],
  },
  {
    name: "Sauvegardes & maintenance",
    tagline: "Vos services restent suivis et vos données récupérables.",
    description:
      "Protégez les fichiers essentiels de votre structure et gardez vos outils à jour dans le temps.",
    icon: "backup",
    features: ["Copies externalisées", "Sauvegardes chiffrées", "Restaurations testées"],
  },
];

export const landingContent = {
  header: {
    brandLabel: "PGYS",
    homeLabel: "PGYS, retour à l’accueil",
    navigationLabel: "Navigation principale",
    mobileMenuLabel: "Ouvrir le menu",
    links: [
      { label: "Services", href: "#services" },
      { label: "Pourquoi PGYS", href: "#pourquoi-pgys" },
      { label: "Offre Cloud", href: "#offres-cloud" },
    ] satisfies Link[],
    cta: { label: "Demander un échange", href: "#contact" },
  },
  hero: {
    eyebrow: "Votre partenaire numérique de proximité",
    title: "Des solutions numériques simples pour les entreprises",
    description:
      "Cloud privé, applications métier, hébergement et maintenance : PGYS accompagne les petites entreprises avec des outils fiables, suivis et sans complexité inutile.",
    primaryCta: { label: "Demander un échange", href: "#contact" },
    secondaryCta: { label: "Découvrir PGYS Cloud", href: "#offres-cloud" },
    proofPoints: ["Accompagnement humain", "Hébergement en France", "Solutions maintenues"],
    panelLabel: "Votre environnement PGYS",
    panelStatus: "Services suivis",
    panelItems: services.map(({ name, tagline, icon }) => ({ name, tagline, icon })),
  },
  services: {
    eyebrow: "Quatre expertises, un seul partenaire",
    title: "L’essentiel de votre numérique, simplement.",
    description:
      "Choisissez le service dont vous avez besoin aujourd’hui. L’ensemble est pensé pour évoluer avec votre structure.",
    services,
  },
  value: {
    eyebrow: "Pourquoi PGYS",
    title: "Un partenaire proche, des solutions maîtrisées.",
    description:
      "PGYS réunit la maîtrise technique et un accompagnement accessible pour que votre numérique reste simple au quotidien.",
    points: [
      {
        number: "01",
        title: "Proximité",
        description:
          "Nous partons de votre activité et de vos usages réels pour proposer une réponse adaptée.",
      },
      {
        number: "02",
        title: "Simplicité",
        description:
          "Des outils compréhensibles, des offres lisibles et aucun jargon technique inutile.",
      },
      {
        number: "03",
        title: "Support humain",
        description:
          "Vous échangez avec une personne qui connaît votre contexte et suit votre solution.",
      },
      {
        number: "04",
        title: "Données hébergées en France",
        description:
          "Nous privilégions un hébergement français pour garder vos données sous contrôle.",
      },
    ],
  },
  pricing: {
    eyebrow: "Offre PGYS Cloud",
    title: "Un espace adapté à la taille de votre équipe.",
    description:
      "Trois offres simples pour stocker, synchroniser et partager vos fichiers. Tarifs indicatifs, sans souscription automatique.",
    plans: [
      {
        name: "Essentiel",
        storage: "100 Go",
        price: "5,99 €",
        period: "/ mois",
        description: "Pour démarrer avec un espace professionnel individuel.",
        features: ["1 utilisateur", "Partage de fichiers", "Support email"],
        cta: { label: "Choisir Essentiel", href: "mailto:contact@pgys.fr?subject=Offre%20PGYS%20Cloud%20Essentiel" },
      },
      {
        name: "Pro",
        storage: "500 Go",
        price: "11,99 €",
        period: "/ mois",
        description: "Pour partager les documents d’une petite équipe.",
        features: ["Jusqu’à 5 utilisateurs", "Synchronisation multi-appareils", "Support prioritaire"],
        cta: { label: "Choisir Pro", href: "mailto:contact@pgys.fr?subject=Offre%20PGYS%20Cloud%20Pro" },
        featured: true,
        badge: "Recommandée",
      },
      {
        name: "Business",
        storage: "2 To",
        price: "24,99 €",
        period: "/ mois",
        description: "Pour centraliser les fichiers d’une structure en croissance.",
        features: ["Jusqu’à 15 utilisateurs", "Support prioritaire", "Accompagnement initial"],
        cta: { label: "Choisir Business", href: "mailto:contact@pgys.fr?subject=Offre%20PGYS%20Cloud%20Business" },
      },
    ] satisfies CloudPlan[],
  },
  cta: {
    eyebrow: "Un besoin, même encore imprécis ?",
    title: "Parlons de ce qui pourrait vous simplifier la journée.",
    description:
      "Un premier échange suffit pour faire le point sur votre situation et identifier une prochaine étape utile.",
    primaryCta: { label: "Écrire à PGYS", href: "mailto:contact@pgys.fr" },
    secondaryText: "Réponse humaine, sans jargon commercial.",
  },
  footer: {
    brandLabel: "PGYS",
    description:
      "Solutions numériques simples, fiables et adaptées aux petites entreprises.",
    navigationLabel: "Navigation du pied de page",
    columns: [
      {
        title: "Services",
        links: services.map(({ name }) => ({ label: name, href: "#services" })),
      },
      {
        title: "PGYS",
        links: [
          { label: "Pourquoi PGYS", href: "#pourquoi-pgys" },
          { label: "Offre PGYS Cloud", href: "#offres-cloud" },
          { label: "Nous contacter", href: "mailto:contact@pgys.fr" },
        ],
      },
    ],
    contactTitle: "Contact",
    email: "contact@pgys.fr",
    location: "France",
    legalNote: "Vos données et vos projets sont traités avec confidentialité.",
  },
};
