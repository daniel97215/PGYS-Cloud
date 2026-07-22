import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { PortalShell } from "@/components/portal-shell";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Administration | PROGYS",
  description: "Accès centralisé aux services numériques PROGYS.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#064bb7",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geist.variable} antialiased`}>
      <body>
        <a
          href="#portal-content"
          className="sr-only z-50 rounded-pgys-md bg-brand px-4 py-3 text-sm font-bold text-white focus:fixed focus:left-4 focus:top-4 focus:not-sr-only"
        >
          Aller au contenu principal
        </a>
        <PortalShell>{children}</PortalShell>
      </body>
    </html>
  );
}
