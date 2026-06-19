import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pgys.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PGYS | Solutions numériques pour petites entreprises",
    template: "%s | PGYS",
  },
  description:
    "Cloud, applications métier, hébergement et sauvegardes : PGYS simplifie le numérique des indépendants, TPE, PME et associations.",
  applicationName: "PGYS",
  keywords: [
    "solutions numériques",
    "cloud professionnel",
    "application métier",
    "hébergement",
    "sauvegarde",
    "TPE",
    "PME",
  ],
  authors: [{ name: "PGYS" }],
  creator: "PGYS",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "PGYS",
    title: "PGYS | Votre partenaire numérique de proximité",
    description:
      "Des outils numériques professionnels, simples et maintenus pour les petites entreprises.",
  },
  twitter: {
    card: "summary",
    title: "PGYS | Solutions numériques pour petites entreprises",
    description:
      "Cloud, applications métier, hébergement et sauvegardes avec un accompagnement humain.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geist.variable} scroll-smooth antialiased`}>
      <body>{children}</body>
    </html>
  );
}
