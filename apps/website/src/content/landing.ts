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

export type Testimonial = {
  audience: string;
  context: string;
  status: string;
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
    name: "PGYS Apps",
    tagline: "Un outil qui suit vraiment votre métier.",
    description:
      "Remplacez les tableaux dispersés et les tâches répétitives par une application adaptée à votre activité.",
    icon: "apps",
    features: ["Conception sur mesure", "Interfaces simples", "Maintenance incluse"],
  },
  {
    name: "PGYS Hosting",
    tagline: "Votre service en ligne, sans la charge technique.",
    description:
      "Confiez-nous l’hébergement, la supervision et la maintenance de vos sites et applications.",
    icon: "hosting",
    features: ["Hébergement en France", "Suivi de disponibilité", "Mises à jour maîtrisées"],
  },
  {
    name: "PGYS Backup",
    tagline: "Vos données restent récupérables.",
    description:
      "Protégez les fichiers essentiels de votre structure avec des sauvegardes externalisées et suivies.",
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
      { label: "Notre approche", href: "#approche" },
      { label: "Témoignages", href: "#temoignages" },
    ] satisfies Link[],
    cta: { label: "Parler de votre besoin", href: "#contact" },
  },
  hero: {
    eyebrow: "Le numérique à taille humaine",
    title: "Des outils professionnels qui vous laissent faire votre métier.",
    description:
      "PGYS accompagne les indépendants, TPE, PME et associations avec un cloud privé, des applications métier, de l’hébergement et des sauvegardes — sans complexité inutile.",
    primaryCta: { label: "Échanger sur mon projet", href: "#contact" },
    secondaryCta: { label: "Découvrir les services", href: "#services" },
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
    eyebrow: "Notre approche",
    title: "La technique reste notre sujet, pas le vôtre.",
    description:
      "Nous traduisons vos besoins en solutions compréhensibles, fiables et suivies dans le temps.",
    points: [
      {
        number: "01",
        title: "On écoute votre quotidien",
        description:
          "Nous partons de vos usages, de vos contraintes et de ce qui vous fait perdre du temps.",
      },
      {
        number: "02",
        title: "On propose une solution claire",
        description:
          "Vous savez ce qui est inclus, comment cela fonctionne et pourquoi c’est utile.",
      },
      {
        number: "03",
        title: "On reste à vos côtés",
        description:
          "Hébergement, maintenance, sauvegardes et support continuent après la mise en ligne.",
      },
    ],
  },
  testimonials: {
    eyebrow: "Retours d’expérience",
    title: "Des relations construites sur la durée.",
    description:
      "Les premiers retours clients seront publiés ici avec leur accord. Pas de faux avis, seulement des expériences vérifiables.",
    items: [
      {
        audience: "Artisan ou TPE",
        context: "Cloud partagé et accompagnement",
        status: "Témoignage à venir",
      },
      {
        audience: "Association",
        context: "Documents communs et gestion des accès",
        status: "Témoignage à venir",
      },
      {
        audience: "PME",
        context: "Application métier et hébergement",
        status: "Témoignage à venir",
      },
    ] satisfies Testimonial[],
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
          { label: "Notre approche", href: "#approche" },
          { label: "Témoignages", href: "#temoignages" },
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
