import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PGYS Espace client",
    short_name: "PGYS",
    description: "Accès mobile aux espaces de votre entreprise.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f7fd",
    theme_color: "#064bb7",
    lang: "fr",
    icons: [
      {
        src: "/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
