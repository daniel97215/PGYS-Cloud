import { Alert, Badge, Button, Card, Heading, Icon } from "@pgys/ui";
import { ServiceCard } from "@/components/service-card";
import { portalMock } from "@/lib/mock";

export default function DashboardPage() {
  const { customer, services, activities, alerts, support } = portalMock;

  return (
    <div className="grid gap-8 lg:gap-10">
      <section
        aria-labelledby="welcome-title"
        className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <Heading
          as="h1"
          id="welcome-title"
          eyebrow="Tableau de bord"
          title={`Bonjour ${customer.firstName}`}
          description="Bienvenue sur votre espace PGYS. Retrouvez ici vos services et vos demandes."
        />
        <Badge variant="brand" className="self-start sm:self-auto">
          Données de démonstration
        </Badge>
      </section>

      <section id="services" aria-labelledby="services-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="services-title" className="text-2xl font-bold text-content">
              Vos services
            </h2>
            <p className="mt-2 text-sm text-content-muted">
              Un aperçu de votre environnement numérique PGYS.
            </p>
          </div>
          <span className="hidden text-sm font-semibold text-content-muted sm:block">
            {services.length} services
          </span>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card as="section" aria-labelledby="activity-title" className="p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-pgys-md bg-surface-muted text-content-muted">
              <Icon name="backup" />
            </span>
            <h2 id="activity-title" className="text-lg font-bold text-content">
              Dernières activités
            </h2>
          </div>
          <div className="mt-8 rounded-pgys-lg border border-dashed border-border bg-surface-muted p-7 text-center">
            <p className="font-bold text-content">{activities.title}</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-content-muted">
              {activities.description}
            </p>
          </div>
        </Card>

        <Card as="section" aria-labelledby="alerts-title" className="p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-pgys-md bg-emerald-50 text-emerald-700">
              <Icon name="bell" />
            </span>
            <h2 id="alerts-title" className="text-lg font-bold text-content">
              Alertes
            </h2>
          </div>
          <Alert variant="success" title={alerts.title} className="mt-8">
            {alerts.description}
          </Alert>
        </Card>
      </div>

      <section id="support" aria-labelledby="support-title">
        <Card className="overflow-hidden border-brand/20 bg-brand-soft p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex max-w-2xl gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-pgys-lg bg-brand text-white">
                <Icon name="ticket" size="lg" />
              </span>
              <div>
                <h2 id="support-title" className="text-xl font-bold text-content">
                  {support.title}
                </h2>
                <p className="mt-2 leading-7 text-content-muted">
                  {support.description}
                </p>
              </div>
            </div>
            <Button href={support.action.href} size="lg" className="shrink-0">
              {support.action.label}
            </Button>
          </div>
        </Card>
      </section>

      <section id="settings" aria-label="Paramètres">
        <p className="text-center text-xs text-content-muted">
          Les paramètres et la facturation seront disponibles dans une prochaine
          version du portail.
        </p>
      </section>
    </div>
  );
}
