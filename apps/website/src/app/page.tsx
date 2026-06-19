import {
  CtaSection,
  HeroSection,
  PricingSection,
  ServicesSection,
  SiteFooter,
  SiteHeader,
  ValueSection,
} from "@/components/landing";
import { landingContent } from "@/content/landing";

const skipLinkClassName = [
  "sr-only z-50 rounded-lg bg-pgys-navy px-4 py-3",
  "text-sm font-semibold text-white",
  "focus:not-sr-only focus:fixed focus:left-4 focus:top-4",
].join(" ");

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-content">
      <a href="#contenu" className={skipLinkClassName}>
        Aller au contenu principal
      </a>

      <SiteHeader {...landingContent.header} />

      <main id="contenu" aria-label="Contenu principal">
        <HeroSection {...landingContent.hero} />
        <ServicesSection {...landingContent.services} />
        <ValueSection {...landingContent.value} />
        <PricingSection {...landingContent.pricing} />
        <CtaSection {...landingContent.cta} />
      </main>

      <SiteFooter
        {...landingContent.footer}
        copyright={`© ${currentYear} PGYS. Tous droits réservés.`}
      />
    </div>
  );
}
