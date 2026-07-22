import { Alert, Badge, Card, Heading, Icon } from "@pgys/ui";
import { ServiceCard } from "@/components/service-card";
import { portalMock } from "@/lib/mock";

export default function DashboardPage() {
  const { services } = portalMock;

  return (
    <div className="grid gap-8 lg:gap-10">
      <section
        aria-labelledby="welcome-title"
        className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <Heading
          as="h1"
          id="welcome-title"
          eyebrow="Administration"
          title="Vos services PROGYS"
          description="Un point d’entrée unique pour rejoindre les services disponibles sur les sous-domaines PROGYS."
        />
        <Badge variant="brand" className="self-start sm:self-auto">
          Lanceur de services
        </Badge>
      </section>

      <Alert variant="info" title="Interface initiale">
        Cette première version centralise les accès. Les fonctions de gestion et
        les droits administrateur seront ajoutés progressivement.
      </Alert>

      <section id="services" aria-labelledby="services-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="services-title" className="text-2xl font-bold text-content">
              Services disponibles
            </h2>
            <p className="mt-2 text-sm text-content-muted">
              Chaque carte ouvre le service concerné dans un nouvel onglet.
            </p>
          </div>
          <span className="hidden text-sm font-semibold text-content-muted sm:block">
            {services.length} accès
          </span>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section id="settings" aria-labelledby="settings-title">
        <Card className="border-brand/20 bg-brand-soft p-6 sm:p-8">
          <div className="flex max-w-3xl gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-pgys-lg bg-brand text-white">
              <Icon name="settings" size="lg" />
            </span>
            <div>
              <h2 id="settings-title" className="text-xl font-bold text-content">
                Administration progressive
              </h2>
              <p className="mt-2 leading-7 text-content-muted">
                Le portail est prêt à accueillir ensuite l’authentification,
                les rôles, la configuration des services et leur supervision.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
