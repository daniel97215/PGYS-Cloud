import Image from "next/image";
import { Button, Container, Icon, Section } from "@pgys/ui";
import type { CloudPlan, Link, Service } from "@/content/landing";
import { ContactForm } from "./contact-form";

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a href="#" aria-label="PROGYS, retour à l’accueil" className="brand-logo">
      <span className="brand-logo-crop" aria-hidden="true">
        <Image
          src="/brand/progys-logo.png"
          alt=""
          width={1693}
          height={963}
          priority
          className={inverse ? "brand-logo-image brightness-0 invert" : "brand-logo-image"}
        />
      </span>
    </a>
  );
}

export function SiteHeader({ links, cta }: { links: Link[]; cta: Link }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <Container className="flex min-h-20 items-center justify-between gap-6">
        <BrandLogo />
        <nav aria-label="Navigation principale" className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-semibold text-slate-600 hover:text-blue-800">
              {link.label}
            </a>
          ))}
          <Button href={cta.href} className="bg-orange-500 shadow-none hover:bg-orange-600">
            {cta.label}
          </Button>
        </nav>
        <details className="relative lg:hidden">
          <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 marker:content-none">
            <Icon name="menu" label="Ouvrir le menu" />
          </summary>
          <nav className="absolute right-0 top-14 grid w-72 gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            {links.map((link) => <a key={link.href} href={link.href} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-slate-50">{link.label}</a>)}
            <Button href={cta.href} className="mt-2 bg-orange-500 hover:bg-orange-600">{cta.label}</Button>
          </nav>
        </details>
      </Container>
    </header>
  );
}

export function HeroSection({ title, description, primaryCta, secondaryCta }: { title: string; description: string; primaryCta: Link; secondaryCta: Link }) {
  return (
    <section className="overflow-hidden border-b border-slate-200 bg-white">
      <Container className="grid min-h-[43rem] items-center gap-12 py-14 lg:grid-cols-[1.04fr_.96fr] lg:py-0">
        <div className="max-w-3xl py-8">
          <h1 aria-label={title} className="text-balance text-5xl font-black leading-[1.02] tracking-[-0.055em] text-slate-950 sm:text-6xl xl:text-7xl">
            Votre informatique, <span className="text-blue-800">simplement</span> <span className="text-orange-500">maîtrisée.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">{description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href={primaryCta.href} size="lg" className="bg-orange-500 shadow-[0_14px_32px_rgb(249_115_22/.2)] hover:bg-orange-600">{primaryCta.label}<Icon name="arrowRight" size="sm" /></Button>
            <Button href={secondaryCta.href} variant="secondary" size="lg" className="border-blue-700 text-blue-800">{secondaryCta.label}</Button>
          </div>
        </div>
        <div className="relative h-[32rem] overflow-hidden rounded-t-[2rem] lg:h-[43rem] lg:self-end lg:rounded-t-[2.5rem]">
          <Image src="/brand/hero-business.png" alt="Professionnelle analysant des documents dans son bureau" fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover object-[50%_28%]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
        </div>
      </Container>
    </section>
  );
}

export function ServicesSection({ title, description, items }: { title: string; description: string; items: Service[] }) {
  return (
    <Section id="services" aria-labelledby="services-title" className="bg-white">
      <Container>
        <div className="mx-auto max-w-3xl text-center"><h2 id="services-title" className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2><p className="mt-4 text-lg leading-8 text-slate-600">{description}</p></div>
        <div className="mt-12 grid overflow-hidden rounded-2xl border border-slate-200 md:grid-cols-2 xl:grid-cols-5">
          {items.map((service) => (
            <article key={service.name} className="border-b border-slate-200 p-7 last:border-b-0 md:border-r xl:border-b-0">
              <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-800"><Icon name={service.icon} size="lg" /></span>
              <h3 className="mt-6 text-lg font-bold text-slate-950">{service.name}</h3>
              <p className="mt-2 text-sm font-semibold text-blue-800">{service.tagline}</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">{service.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function ValueBand({ values }: { values: Array<{ title: string; description: string }> }) {
  return <section id="solutions" className="bg-blue-900 py-12 text-white"><Container><div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">{values.map((value) => <div key={value.title} className="border-l border-white/25 pl-5"><p className="font-bold">{value.title}</p><p className="mt-2 text-sm leading-6 text-blue-100">{value.description}</p></div>)}</div></Container></section>;
}

export function PricingSection({ title, description, plans }: { title: string; description: string; plans: CloudPlan[] }) {
  return (
    <Section id="tarifs" className="bg-slate-50" aria-labelledby="pricing-title"><Container>
      <div className="max-w-2xl"><h2 id="pricing-title" className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2><p className="mt-4 text-lg leading-8 text-slate-600">{description}</p></div>
      <div className="mt-10 grid gap-5 lg:grid-cols-3">{plans.map((plan) => <article key={plan.name} className={plan.featured ? "rounded-2xl border-2 border-orange-500 bg-white p-7 shadow-xl" : "rounded-2xl border border-slate-200 bg-white p-7"}><p className="text-lg font-bold text-slate-950">{plan.name}</p><p className="mt-5 text-4xl font-black text-blue-900">{plan.storage}</p><p className="mt-2 font-bold text-orange-600">{plan.price}</p><p className="mt-5 min-h-14 text-sm leading-6 text-slate-600">{plan.description}</p><ul className="mt-6 space-y-3 border-t border-slate-200 pt-6">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm font-semibold"><Icon name="check" className="text-emerald-600" />{feature}</li>)}</ul><Button href="#contact" variant={plan.featured ? "primary" : "secondary"} className={plan.featured ? "mt-8 w-full bg-orange-500 hover:bg-orange-600" : "mt-8 w-full"}>Choisir cette offre</Button></article>)}</div>
    </Container></Section>
  );
}

export function ContactSection() {
  return <Section id="contact" aria-labelledby="contact-title" className="bg-white"><Container className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><h2 id="contact-title" className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Parlez-nous de votre projet</h2><p className="mt-5 text-lg leading-8 text-slate-600">Décrivez-nous votre besoin, même s’il est encore imprécis. Nous vous répondrons avec une prochaine étape claire, sans jargon inutile.</p><div className="mt-8 border-l-4 border-orange-500 pl-5"><p className="font-bold text-slate-950">Une réponse humaine</p><p className="mt-2 text-sm leading-6 text-slate-600">Votre demande est lue par l’équipe PROGYS, pas par un robot commercial.</p></div></div><ContactForm /></Container></Section>;
}

export function SiteFooter() {
  return <footer className="bg-slate-950 py-12 text-slate-300"><Container className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]"><div><BrandLogo inverse /><p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">Votre informatique, simplement maîtrisée.</p></div><div><p className="font-bold text-white">Services</p><div className="mt-4 grid gap-2 text-sm text-slate-400"><a href="#services">Cloud privé</a><a href="#services">Applications métier</a><a href="#services">Hébergement & maintenance</a></div></div><div><p className="font-bold text-white">Contact</p><a href="mailto:contact@pgys.fr" className="mt-4 block text-sm text-slate-400">contact@pgys.fr</a><p className="mt-2 text-sm text-slate-400">France</p></div><p className="border-t border-white/10 pt-6 text-xs text-slate-500 md:col-span-3">© {new Date().getFullYear()} PROGYS Services Informatiques. Tous droits réservés.</p></Container></footer>;
}
