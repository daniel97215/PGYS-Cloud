import { ContactSection, HeroSection, PricingSection, ServicesSection, SiteFooter, SiteHeader, ValueBand } from "@/components/landing";
import { landingContent } from "@/content/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <a href="#contenu" className="sr-only z-50 rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white focus:fixed focus:left-4 focus:top-4 focus:not-sr-only">Aller au contenu principal</a>
      <SiteHeader {...landingContent.header} />
      <main id="contenu">
        <HeroSection {...landingContent.hero} />
        <ServicesSection {...landingContent.services} />
        <ValueBand values={landingContent.values} />
        <PricingSection {...landingContent.pricing} />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
