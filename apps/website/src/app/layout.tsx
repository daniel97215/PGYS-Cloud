import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pgys.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "PROGYS | Services informatiques pour les entreprises", template: "%s | PROGYS" },
  description: "Cloud privé, applications métier, hébergement, maintenance et sauvegardes : PROGYS simplifie l’informatique des TPE, PME et associations.",
  applicationName: "PROGYS",
  keywords: ["services informatiques", "cloud privé", "application métier", "hébergement", "maintenance", "sauvegarde", "TPE", "PME"],
  authors: [{ name: "PROGYS" }],
  creator: "PROGYS",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "fr_FR", url: "/", siteName: "PROGYS",
    title: "PROGYS | Votre informatique, simplement maîtrisée",
    description: "Des solutions informatiques fiables, simples et maintenues pour les entreprises.",
  },
  twitter: {
    card: "summary", title: "PROGYS | Services informatiques pour les entreprises",
    description: "Cloud privé, applications métier, hébergement, maintenance et sauvegardes avec un accompagnement humain.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" className={`${geist.variable} scroll-smooth antialiased`}><body>{children}</body></html>;
}
