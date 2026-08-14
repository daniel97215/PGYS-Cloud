import { Alert, Badge, Icon } from "@pgys/ui";
import { adminPortal } from "@/lib/admin";

export default function DashboardPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:gap-9">
      <section aria-labelledby="admin-title">
        <h1
          id="admin-title"
          className="text-3xl font-black tracking-[-0.035em] text-content sm:text-4xl"
        >
          Centre d’administration
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-content-muted">
          Supervisez la plateforme PGYS depuis un espace réservé aux opérateurs
          internes.
        </p>
      </section>

      <Alert variant="info" title="Accès interne PGYS" className="px-5 py-5">
        <p>
          Les permissions <strong>OWNER</strong> et <strong>ADMIN</strong> des
          clients restent limitées à leur propre workspace.
        </p>
        <p className="mt-1.5">
          L’accès global des opérateurs utilisera une autorisation Platform
          dédiée avant toute donnée réelle.
        </p>
      </Alert>

      <section id="modules" aria-labelledby="modules-title">
        <div className="mb-4">
          <h2 id="modules-title" className="text-xl font-bold text-content">
            Espaces d’administration
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-content-muted">
            Les vues métier seront livrées séparément, avec leurs propres
            contrats et contrôles d’accès.
          </p>
        </div>
        <div className="overflow-hidden rounded-pgys-lg border border-border bg-surface shadow-pgys-sm">
          {adminPortal.modules.map((module, index) => (
            <article
              key={module.id}
              className={`flex items-center gap-4 px-5 py-5 sm:px-6 ${
                index === 0 ? "" : "border-t border-border"
              }`}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-pgys-md bg-brand-soft text-brand-dark">
                <Icon name={module.icon} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-content">{module.title}</h3>
                <p className="mt-1 text-sm leading-6 text-content-muted">
                  {module.description}
                </p>
              </div>
              <span className="hidden shrink-0 sm:block">
                <Badge variant="brand">Prochainement</Badge>
              </span>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-content-muted sm:hidden">
          Les modules Workspaces, Abonnements et Audit seront activés dans les
          prochains tickets.
        </p>
      </section>
    </div>
  );
}
