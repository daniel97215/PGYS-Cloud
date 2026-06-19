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

export default function Home() {
  return (
    <>
      <a
        href="#contenu"
        className={[
          "sr-only z-50 rounded-lg bg-pgys-navy px-4 py-3",
          "text-sm font-semibold text-white",
          "focus:not-sr-only focus:fixed focus:left-4 focus:top-4",
        ].join(" ")}
      >
        Aller au contenu
      </a>
      <SiteHeader {...landingContent.header} />
      <main id="contenu">
        <HeroSection {...landingContent.hero} />
        <ServicesSection {...landingContent.services} />
        <ValueSection {...landingContent.value} />
        <PricingSection {...landingContent.pricing} />
        <CtaSection {...landingContent.cta} />
      </main>
      <SiteFooter
        {...landingContent.footer}
        copyright={`© ${new Date().getFullYear()} PGYS. Tous droits réservés.`}
      />
    </>
  );
}
