import {
  Badge,
  Button,
  Card,
  Container,
  Footer,
  Heading,
  Icon,
  Navbar,
  Section,
} from "@pgys/ui";
import type { IconName } from "@pgys/ui";
import type { CloudPlan, Link, Service } from "@/content/landing";

type HeaderProps = {
  brandLabel: string;
  homeLabel: string;
  navigationLabel: string;
  mobileMenuLabel: string;
  links: Link[];
  cta: Link;
};

export function SiteHeader({
  brandLabel,
  homeLabel,
  navigationLabel,
  mobileMenuLabel,
  links,
  cta,
}: HeaderProps) {
  return (
    <Navbar
      brandLabel={brandLabel}
      homeHref="#"
      homeLabel={homeLabel}
      navigationLabel={navigationLabel}
      menuLabel={mobileMenuLabel}
      links={links}
      action={cta}
    />
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
    <section
      className="soft-glow relative overflow-hidden border-b border-border"
      aria-labelledby="hero-title"
    >
      <div className="hero-grid absolute inset-0" aria-hidden="true" />
      <Container className="relative grid items-center gap-14 py-20 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:py-30">
        <div>
          <Badge variant="brand" className="mb-6 px-4 py-2 shadow-pgys-sm">
            {eyebrow}
          </Badge>
          <h1
            id="hero-title"
            className="max-w-3xl text-balance text-4xl font-black leading-[1.08] tracking-[-0.055em] text-content sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-content-muted sm:text-xl">
            {description}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href={primaryCta.href} size="lg">
              {primaryCta.label}
              <Icon name="arrowRight" size="sm" />
            </Button>
            <Button href={secondaryCta.href} variant="secondary" size="lg">
              {secondaryCta.label}
            </Button>
          </div>
          <ul
            className="mt-9 flex flex-wrap gap-x-6 gap-y-3"
            aria-label="Engagements PGYS"
          >
            {proofPoints.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 text-sm font-semibold text-content-muted"
              >
                <Icon name="check" className="text-success" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:justify-self-end">
          <div
            className="absolute -inset-5 rotate-2 rounded-[2rem] bg-brand/10"
            aria-hidden="true"
          />
          <Card className="relative overflow-hidden border-white/80 p-3 backdrop-blur">
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
              <p className="font-bold text-content">{panelLabel}</p>
              <Badge variant="success">
                <span className="size-2 rounded-full bg-success" />
                {panelStatus}
              </Badge>
            </div>
            <div className="grid gap-2 p-2 sm:grid-cols-2">
              {panelItems.map((item) => (
                <Card key={item.name} variant="muted" className="p-4 sm:p-5">
                  <ServiceIcon name={item.icon} size="small" />
                  <p className="mt-4 font-bold text-content">{item.name}</p>
                  <p className="mt-1 text-sm leading-6 text-content-muted">
                    {item.tagline}
                  </p>
                </Card>
              ))}
            </div>
          </Card>
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

export function ServicesSection({
  eyebrow,
  title,
  description,
  services,
}: ServicesProps) {
  return (
    <Section id="services" aria-labelledby="services-title">
      <Container>
        <Heading
          eyebrow={eyebrow}
          title={title}
          description={description}
          id="services-title"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <Card
      as="article"
      className="group p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 sm:p-8"
    >
      <ServiceIcon name={service.icon} />
      <p className="mt-6 text-sm font-bold text-brand">{service.tagline}</p>
      <h3 className="mt-2 text-2xl font-bold tracking-tight text-content">
        {service.name}
      </h3>
      <p className="mt-4 leading-7 text-content-muted">{service.description}</p>
      <ul
        className="mt-6 grid gap-3 border-t border-border pt-6 sm:grid-cols-3"
        aria-label={`Points clés de ${service.name}`}
      >
        {service.features.map((feature) => (
          <li
            key={feature}
            className="flex gap-2 text-sm font-semibold text-content"
          >
            <Icon name="check" className="text-success" />
            {feature}
          </li>
        ))}
      </ul>
    </Card>
  );
}

type ValueProps = {
  eyebrow: string;
  title: string;
  description: string;
  points: Array<{ number: string; title: string; description: string }>;
};

export function ValueSection({
  eyebrow,
  title,
  description,
  points,
}: ValueProps) {
  return (
    <Section
      id="pourquoi-pgys"
      aria-labelledby="why-title"
      tone="dark"
    >
      <Container>
        <Heading
          eyebrow={eyebrow}
          title={title}
          description={description}
          id="why-title"
          inverse
        />
        <ol className="mt-14 grid gap-px overflow-hidden rounded-pgys-xl border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
          {points.map((point) => (
            <li key={point.number} className="bg-slate-950 p-7 sm:p-9">
              <span className="text-sm font-black tracking-[0.2em] text-blue-300">
                {point.number}
              </span>
              <h3 className="mt-8 text-xl font-bold text-white">{point.title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{point.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

type PricingProps = {
  eyebrow: string;
  title: string;
  description: string;
  plans: CloudPlan[];
};

export function PricingSection({
  eyebrow,
  title,
  description,
  plans,
}: PricingProps) {
  return (
    <Section
      id="offres-cloud"
      aria-labelledby="pricing-title"
      tone="muted"
    >
      <Container>
        <Heading
          eyebrow={eyebrow}
          title={title}
          description={description}
          id="pricing-title"
          align="center"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function PricingCard({ plan }: { plan: CloudPlan }) {
  return (
    <Card
      as="article"
      className={plan.featured ? "relative p-7 ring-2 ring-brand md:-translate-y-3" : "relative p-7"}
    >
      {plan.badge ? (
        <Badge variant="brand" className="absolute right-5 top-5">
          {plan.badge}
        </Badge>
      ) : null}
      <p className="text-lg font-bold text-content">{plan.name}</p>
      <p className="mt-5 text-4xl font-black tracking-[-0.04em] text-brand-dark">
        {plan.storage}
      </p>
      <p className="mt-2 text-content-muted">
        <span className="font-bold text-content">{plan.price}</span> {plan.period}
      </p>
      <p className="mt-5 min-h-14 leading-7 text-content-muted">
        {plan.description}
      </p>
      <ul
        className="mt-7 flex-1 space-y-3 border-t border-border pt-6"
        aria-label={`Inclus dans l’offre ${plan.name}`}
      >
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex gap-2 text-sm font-semibold text-content"
          >
            <Icon name="check" className="text-success" />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        href={plan.cta.href}
        variant={plan.featured ? "primary" : "secondary"}
        className="mt-8 w-full"
      >
        {plan.cta.label}
      </Button>
    </Card>
  );
}

type CtaProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: Link;
  secondaryText: string;
};

export function CtaSection({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryText,
}: CtaProps) {
  return (
    <Section id="contact" aria-labelledby="contact-title">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-brand px-6 py-12 text-center shadow-pgys-brand sm:px-12 sm:py-16 lg:px-20">
          <div
            className="absolute -right-24 -top-32 size-80 rounded-full border-[60px] border-white/10"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-100">
              {eyebrow}
            </p>
            <h2
              id="contact-title"
              className="mt-4 text-balance text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl"
            >
              {title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
              {description}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button href={primaryCta.href} variant="light" size="lg">
                {primaryCta.label}
                <Icon name="arrowRight" size="sm" />
              </Button>
              <p className="text-sm font-semibold text-blue-100">
                {secondaryText}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
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
    <Footer
      brandLabel={brandLabel}
      homeHref="#"
      description={description}
      navigationLabel={navigationLabel}
      columns={columns}
      contact={{ title: contactTitle, email, location }}
      copyright={copyright}
      legalNote={legalNote}
    />
  );
}

function ServiceIcon({
  name,
  size = "large",
}: {
  name: IconName;
  size?: "small" | "large";
}) {
  return (
    <span
      className={
        size === "small"
          ? "grid size-9 place-items-center rounded-pgys-md bg-brand-soft text-brand"
          : "grid size-12 place-items-center rounded-pgys-lg bg-brand-soft text-brand"
      }
      aria-hidden="true"
    >
      <Icon name={name} size={size === "small" ? "md" : "lg"} />
    </span>
  );
}
