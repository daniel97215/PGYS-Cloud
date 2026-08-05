import Image from "next/image";
import type { Metadata } from "next";
import { Button, Container, Icon } from "@pgys/ui";
import { BrandLogo } from "@/components/landing";

export const metadata: Metadata = {
  title: "Portail PROGYS",
  description: "Accédez aux services et informations PROGYS ouverts aux clients.",
};

const clientServices = [
  {
    name: "PROGYS Cloud",
    description: "Fichiers, partages et collaboration sécurisée.",
    href: "https://cloud.pgys.fr",
    icon: "cloud" as const,
    action: "Accéder au Cloud",
  },
  {
    name: "État des services",
    description: "Consultez la disponibilité de l’infrastructure PROGYS.",
    href: "https://status.pgys.fr",
    icon: "hosting" as const,
    action: "Voir l’état des services",
  },
];

export default function ProgysPortalPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <Container className="flex min-h-20 items-center justify-between gap-6">
          <BrandLogo />
          <Button href="/" variant="subtle">
            Retour au site
          </Button>
        </Container>
      </header>

      <section className="overflow-hidden border-b border-slate-200 bg-white">
        <Container className="grid items-center gap-10 py-12 lg:grid-cols-[1fr_.82fr] lg:py-0">
          <div className="max-w-3xl py-8 lg:py-20">
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Votre point d’entrée vers l’écosystème PROGYS
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Retrouvez vos services, les informations utiles et, demain, vos
              applications métier dans un espace unique et sécurisé.
            </p>
          </div>
          <div className="relative h-72 overflow-hidden rounded-t-[2rem] lg:h-[27rem] lg:self-end">
            <Image
              src="/brand/portal-services.jpg"
              alt="Professionnelle consultant ses documents et outils numériques"
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">
            Services accessibles
          </h2>
          <p className="mt-3 text-lg leading-8 text-slate-600">
            Seuls les services ouverts aux clients sont présentés ici. Les
            outils d’administration et les interfaces techniques restent privés.
          </p>
        </div>

        <section aria-label="Services accessibles" className="mt-10 grid gap-6 md:grid-cols-2">
          {clientServices.map((service) => (
            <article key={service.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-800">
                <Icon name={service.icon} size="lg" />
              </span>
              <h3 className="mt-6 text-2xl font-black text-slate-950">{service.name}</h3>
              <p className="mt-3 flex-1 leading-7 text-slate-600">{service.description}</p>
              <Button href={service.href} className="mt-7 bg-blue-800 hover:bg-blue-900">
                {service.action}
                <Icon name="arrowRight" size="sm" />
              </Button>
            </article>
          ))}
        </section>

        <aside className="mt-10 flex flex-col gap-5 rounded-2xl bg-slate-950 p-7 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black">Vous ne trouvez pas votre accès ?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Certaines applications sont réservées à des utilisateurs ou à des
              équipes spécifiques. Contactez-nous pour être orienté correctement.
            </p>
          </div>
          <Button href="/#contact" className="shrink-0 bg-orange-500 hover:bg-orange-600">
            Nous contacter
          </Button>
        </aside>
      </Container>
    </main>
  );
}
