import type { ReactNode } from "react";
import type { CloudPlan, Link, Service, ServiceIconName } from "@/content/landing";
import { ButtonLink, Container, SectionHeading } from "@/components/ui";

type HeaderProps = {
  brandLabel: string;
  homeLabel: string;
  navigationLabel: string;
  mobileMenuLabel: string;
  links: Link[];
  cta: Link;
};

function Brand({
  label,
  homeLabel,
  inverse = false,
}: {
  label: string;
  homeLabel: string;
  inverse?: boolean;
}) {
  return (
    <a
      href="#"
      aria-label={homeLabel}
      className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-pgys-blue"
    >
      <span
        className={`grid size-9 place-items-center rounded-xl text-sm font-black ${
          inverse ? "bg-white text-pgys-navy" : "bg-pgys-blue text-white"
        }`}
        aria-hidden="true"
      >
        P
      </span>
      <span
        className={`text-xl font-black tracking-[-0.04em] ${
          inverse ? "text-white" : "text-pgys-ink"
        }`}
      >
        {label}
      </span>
    </a>
  );
}

export function SiteHeader({
  brandLabel,
  homeLabel,
  navigationLabel,
  mobileMenuLabel,
  links,
  cta,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <Container className="flex min-h-18 items-center justify-between gap-6">
        <Brand label={brandLabel} homeLabel={homeLabel} />
        <nav aria-label={navigationLabel} className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md text-sm font-semibold text-pgys-slate transition-colors hover:text-pgys-blue focus-visible:outline-2 focus-visible:outline-pgys-blue"
            >
              {link.label}
            </a>
          ))}
          <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
        </nav>
        <details className="group relative lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-bold text-pgys-ink marker:content-none focus-visible:outline-2 focus-visible:outline-pgys-blue">
            <span>{mobileMenuLabel}</span>
            <ChevronIcon />
          </summary>
          <nav
            aria-label={navigationLabel}
            className="absolute right-0 top-14 flex w-72 flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-pgys-slate hover:bg-pgys-mist hover:text-pgys-blue"
              >
                {link.label}
              </a>
            ))}
            <ButtonLink href={cta.href} className="mt-2">
              {cta.label}
            </ButtonLink>
          </nav>
        </details>
      </Container>
    </header>
  );
}

type HeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: Link;
  secondaryCta: Link;
  proofPoints: string[];
  panelLabel: string;
  panelStatus: string;
  panelItems: Array<Pick<Service, "name" | "tagline" | "icon">>;
};

export function HeroSection({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  proofPoints,
  panelLabel,
  panelStatus,
  panelItems,
}: HeroProps) {
  return (
    <section className="soft-glow relative overflow-hidden border-b border-slate-100" aria-labelledby="hero-title">
      <div className="hero-grid absolute inset-0" aria-hidden="true" />
      <Container className="relative grid items-center gap-14 py-20 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:py-30">
        <div>
          <p className="mb-6 inline-flex rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-bold text-pgys-blue shadow-sm">
            {eyebrow}
          </p>
          <h1
            id="hero-title"
            className="max-w-3xl text-balance text-4xl font-black leading-[1.08] tracking-[-0.055em] text-pgys-ink sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-pgys-slate sm:text-xl">{description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={primaryCta.href}>
              {primaryCta.label}
              <ArrowIcon />
            </ButtonLink>
            <ButtonLink href={secondaryCta.href} variant="secondary">
              {secondaryCta.label}
            </ButtonLink>
          </div>
          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3" aria-label="Engagements PGYS">
            {proofPoints.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 text-sm font-semibold text-pgys-slate"
              >
                <CheckIcon />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:justify-self-end">
          <div className="absolute -inset-5 rotate-2 rounded-[2rem] bg-pgys-blue/10" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/92 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
              <p className="font-bold text-pgys-ink">{panelLabel}</p>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <span className="size-2 rounded-full bg-pgys-success" />
                {panelStatus}
              </span>
            </div>
            <div className="grid gap-2 p-2 sm:grid-cols-2">
              {panelItems.map((item) => (
                <div key={item.name} className="rounded-2xl border border-slate-100 bg-pgys-mist p-4 sm:p-5">
                  <ServiceIcon name={item.icon} size="small" />
                  <p className="mt-4 font-bold text-pgys-ink">{item.name}</p>
                  <p className="mt-1 text-sm leading-6 text-pgys-slate">{item.tagline}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

type ServicesProps = {
  eyebrow: string;
  title: string;
  description: string;
  services: Service[];
};

export function ServicesSection({ eyebrow, title, description, services }: ServicesProps) {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="scroll-mt-24 bg-white py-20 sm:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          titleId="services-title"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8">
      <ServiceIcon name={service.icon} />
      <p className="mt-6 text-sm font-bold text-pgys-blue">{service.tagline}</p>
      <h3 className="mt-2 text-2xl font-bold tracking-tight text-pgys-ink">{service.name}</h3>
      <p className="mt-4 leading-7 text-pgys-slate">{service.description}</p>
      <ul
        className="mt-6 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-3"
        aria-label={`Points clés de ${service.name}`}
      >
        {service.features.map((feature) => (
          <li
            key={feature}
            className="flex gap-2 text-sm font-semibold text-pgys-ink"
          >
            <CheckIcon />
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}

type ValueProps = {
  eyebrow: string;
  title: string;
  description: string;
  points: Array<{ number: string; title: string; description: string }>;
};

export function ValueSection({ eyebrow, title, description, points }: ValueProps) {
  return (
    <section
      id="pourquoi-pgys"
      aria-labelledby="why-title"
      className="scroll-mt-24 bg-pgys-ink py-20 sm:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          titleId="why-title"
          inverse
        />
        <ol className="mt-14 grid gap-px overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
          {points.map((point) => (
            <li key={point.number} className="bg-pgys-ink p-7 sm:p-9">
              <span className="text-sm font-black tracking-[0.2em] text-blue-300">{point.number}</span>
              <h3 className="mt-8 text-xl font-bold text-white">{point.title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{point.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

type PricingProps = {
  eyebrow: string;
  title: string;
  description: string;
  plans: CloudPlan[];
};

export function PricingSection({ eyebrow, title, description, plans }: PricingProps) {
  return (
    <section
      id="offres-cloud"
      aria-labelledby="pricing-title"
      className="scroll-mt-24 bg-pgys-mist py-20 sm:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          titleId="pricing-title"
          align="center"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function PricingCard({ plan }: { plan: CloudPlan }) {
  const cardClassName = plan.featured
    ? "border-pgys-blue shadow-[0_20px_55px_rgba(37,99,235,0.16)] md:-translate-y-3"
    : "border-slate-200 shadow-sm";

  return (
    <article
      className={`relative flex flex-col rounded-[1.5rem] border bg-white p-7 ${cardClassName}`}
    >
      {plan.badge ? (
        <p className="absolute right-5 top-5 rounded-full bg-pgys-blue-light px-3 py-1 text-xs font-bold text-pgys-navy">
          {plan.badge}
        </p>
      ) : null}
      <p className="text-lg font-bold text-pgys-ink">{plan.name}</p>
      <p className="mt-5 text-4xl font-black tracking-[-0.04em] text-pgys-navy">{plan.storage}</p>
      <p className="mt-2 text-pgys-slate">
        <span className="font-bold text-pgys-ink">{plan.price}</span>{" "}
        {plan.period}
      </p>
      <p className="mt-5 min-h-14 leading-7 text-pgys-slate">{plan.description}</p>
      <ul
        className="mt-7 flex-1 space-y-3 border-t border-slate-100 pt-6"
        aria-label={`Inclus dans l’offre ${plan.name}`}
      >
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex gap-2 text-sm font-semibold text-pgys-ink"
          >
            <CheckIcon />
            {feature}
          </li>
        ))}
      </ul>
      <ButtonLink
        href={plan.cta.href}
        variant={plan.featured ? "primary" : "secondary"}
        className="mt-8 w-full"
      >
        {plan.cta.label}
      </ButtonLink>
    </article>
  );
}

type CtaProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: Link;
  secondaryText: string;
};

export function CtaSection({ eyebrow, title, description, primaryCta, secondaryText }: CtaProps) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="scroll-mt-24 bg-white py-20 sm:py-28"
    >
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-pgys-blue px-6 py-12 text-center shadow-[0_24px_70px_rgba(37,99,235,0.2)] sm:px-12 sm:py-16 lg:px-20">
          <div
            className="absolute -right-24 -top-32 size-80 rounded-full border-[60px] border-white/10"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-100">{eyebrow}</p>
            <h2
              id="contact-title"
              className="mt-4 text-balance text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl"
            >
              {title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">{description}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href={primaryCta.href} variant="light">
                {primaryCta.label}
                <ArrowIcon />
              </ButtonLink>
              <p className="text-sm font-semibold text-blue-100">{secondaryText}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

type FooterProps = {
  brandLabel: string;
  description: string;
  navigationLabel: string;
  columns: Array<{ title: string; links: Link[] }>;
  contactTitle: string;
  email: string;
  location: string;
  legalNote: string;
  copyright: string;
};

export function SiteFooter({
  brandLabel,
  description,
  navigationLabel,
  columns,
  contactTitle,
  email,
  location,
  legalNote,
  copyright,
}: FooterProps) {
  return (
    <footer className="bg-pgys-ink text-slate-300">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Brand label={brandLabel} homeLabel={`${brandLabel}, retour à l’accueil`} inverse />
            <p className="mt-5 leading-7 text-slate-400">{description}</p>
          </div>
          <nav aria-label={navigationLabel} className="contents">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="font-bold text-white">{column.title}</p>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <a
                        href={link.href}
                        className="rounded text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div>
            <p className="font-bold text-white">{contactTitle}</p>
            <a
              href={`mailto:${email}`}
              className="mt-5 block rounded text-sm text-slate-400 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              {email}
            </a>
            <p className="mt-3 text-sm text-slate-400">{location}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{copyright}</p>
          <p>{legalNote}</p>
        </div>
      </Container>
    </footer>
  );
}

function ServiceIcon({
  name,
  size = "large",
}: {
  name: ServiceIconName;
  size?: "small" | "large";
}) {
  const iconClass = size === "small" ? "size-9 rounded-xl" : "size-12 rounded-2xl";
  const paths: Record<ServiceIconName, ReactNode> = {
    cloud: (
      <>
        <path d="M7 18a4 4 0 0 1-.4-7.98A6 6 0 0 1 18 8a5 5 0 0 1 0 10H7Z" />
        <path d="M12 12v7m0-7-2.5 2.5M12 12l2.5 2.5" />
      </>
    ),
    apps: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <path d="M17 14v6m-3-3h6" />
      </>
    ),
    hosting: (
      <>
        <rect x="4" y="5" width="16" height="6" rx="2" />
        <rect x="4" y="13" width="16" height="6" rx="2" />
        <path d="M8 8h.01M8 16h.01M12 8h5M12 16h5" />
      </>
    ),
    backup: (
      <>
        <path d="M20 11a8 8 0 1 0-2.34 5.66" />
        <path d="M20 5v6h-6" />
        <path d="M12 8v4l3 2" />
      </>
    ),
  };

  return (
    <span
      className={`grid place-items-center bg-pgys-blue-light text-pgys-blue ${iconClass}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className={size === "small" ? "size-5" : "size-6"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths[name]}
      </svg>
    </span>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="mt-0.5 size-5 shrink-0 text-pgys-success"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="m5 10 3 3 7-7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="ml-2 size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M4 10h12m-4-4 4 4-4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-4 transition group-open:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="m6 8 4 4 4-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
