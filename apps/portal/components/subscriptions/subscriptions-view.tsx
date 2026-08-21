"use client";

import { FormEvent, useEffect, useState } from "react";
import { Icon } from "@pgys/ui";

type SubscriptionStatus =
  | "pending"
  | "active"
  | "suspended"
  | "cancelled"
  | "expired";

type PlatformRole = "PLATFORM_ADMIN" | "PLATFORM_SUPPORT";

interface PlatformSubscription {
  id: string;
  status: SubscriptionStatus;
  workspace: { id: string; displayName: string; slug: string };
  offer: { id: string; key: string; name: string };
  price: {
    id: string;
    amount: string;
    currency: string;
    billingPeriod: string;
  } | null;
  startedAt: string;
  endsAt: string | null;
  cancelledAt: string | null;
  renewalDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionPage {
  items: PlatformSubscription[];
  total: number;
  page: number;
  pageSize: number;
  accessRole: PlatformRole;
}

const STATUS_OPTIONS: Array<{
  label: string;
  value: SubscriptionStatus | "";
}> = [
  { label: "Tous les statuts", value: "" },
  { label: "Actif", value: "active" },
  { label: "En attente", value: "pending" },
  { label: "Suspendu", value: "suspended" },
  { label: "Annulé", value: "cancelled" },
  { label: "Expiré", value: "expired" },
];

const STATUS_STYLES: Record<
  SubscriptionStatus,
  { className: string; label: string }
> = {
  active: { label: "Actif", className: "bg-emerald-50 text-emerald-800" },
  pending: { label: "En attente", className: "bg-blue-50 text-blue-800" },
  suspended: { label: "Suspendu", className: "bg-amber-50 text-amber-800" },
  cancelled: { label: "Annulé", className: "bg-slate-100 text-slate-700" },
  expired: { label: "Expiré", className: "bg-orange-50 text-orange-800" },
};

export function SubscriptionsView() {
  const [data, setData] = useState<SubscriptionPage | null>(null);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus | "">("");
  const [page, setPage] = useState(1);
  const [requestSequence, setRequestSequence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (submittedSearch) query.set("search", submittedSearch);
    if (status) query.set("status", status);

    fetch(`/api/platform/subscriptions?${query.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.assign("/login");
          return null;
        }
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          throw new Error(
            body?.message ?? "Impossible de charger les abonnements",
          );
        }
        return (await response.json()) as SubscriptionPage;
      })
      .then((result) => {
        if (result) setData(result);
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name !== "AbortError") {
          setError(reason.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page, requestSequence, status, submittedSearch]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setPage(1);
    setSubmittedSearch(search.trim());
    setRequestSequence((current) => current + 1);
  }

  const firstItem =
    data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0;
  const lastItem = data ? Math.min(data.page * data.pageSize, data.total) : 0;
  const hasNext = data ? lastItem < data.total : false;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.035em] text-content sm:text-4xl">
            Abonnements
          </h1>
          <p className="mt-3 text-base leading-7 text-content-muted">
            Consultez les engagements commerciaux des sociétés clientes.
          </p>
        </div>
        <span className="inline-flex min-h-9 self-start items-center gap-2 rounded-pgys-md border border-brand/30 px-3 text-sm font-bold text-brand-dark">
          <Icon name="eye" size="sm" />
          Lecture seule
        </span>
      </div>

      <form
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        onSubmit={submitSearch}
      >
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Rechercher un abonnement</span>
          <span className="pointer-events-none absolute inset-y-0 left-3.5 grid place-items-center text-content-muted">
            <Icon name="search" size="sm" />
          </span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Société ou offre"
            className="min-h-12 w-full rounded-pgys-md border border-border bg-surface pl-11 pr-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>
        <label>
          <span className="sr-only">Filtrer par statut</span>
          <select
            value={status}
            onChange={(event) => {
              setLoading(true);
              setError(null);
              setStatus(event.target.value as SubscriptionStatus | "");
              setPage(1);
            }}
            className="min-h-12 w-full rounded-pgys-md border border-border bg-surface px-4 text-sm font-semibold outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 sm:w-56"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </form>

      <section
        aria-label="Liste des abonnements"
        className="mt-7 overflow-hidden rounded-pgys-lg border border-border bg-surface shadow-pgys-sm"
      >
        {error ? <SubscriptionError message={error} /> : null}
        {!error && loading ? <SubscriptionLoading /> : null}
        {!error && !loading && data?.items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-bold text-content">Aucun abonnement trouvé</p>
            <p className="mt-2 text-sm text-content-muted">
              Modifiez la recherche ou le statut sélectionné.
            </p>
          </div>
        ) : null}

        {!error && !loading && data?.items.length ? (
          <>
            <div className="hidden lg:block">
              <table className="w-full border-collapse text-left">
                <thead className="bg-surface-muted text-xs font-bold uppercase tracking-wide text-content-muted">
                  <tr>
                    <th className="px-6 py-4">Société</th>
                    <th className="px-5 py-4">Offre</th>
                    <th className="px-5 py-4">Statut</th>
                    <th className="px-5 py-4">Prix</th>
                    <th className="px-6 py-4">Renouvellement</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((subscription) => (
                    <SubscriptionTableRow
                      key={subscription.id}
                      subscription={subscription}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-border lg:hidden">
              {data.items.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                />
              ))}
            </div>
          </>
        ) : null}

        {!error && data ? (
          <footer className="flex items-center justify-between border-t border-border px-5 py-4 text-sm text-content-muted sm:px-6">
            <span>
              {firstItem}–{lastItem} sur {data.total}
            </span>
            <div className="flex gap-2">
              <PaginationButton
                label="Page précédente"
                icon="chevronLeft"
                disabled={data.page <= 1 || loading}
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  setPage((current) => Math.max(1, current - 1));
                }}
              />
              <PaginationButton
                label="Page suivante"
                icon="chevronRight"
                disabled={!hasNext || loading}
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  setPage((current) => current + 1);
                }}
              />
            </div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}

function SubscriptionTableRow({
  subscription,
}: {
  subscription: PlatformSubscription;
}) {
  return (
    <tr className="border-t border-border first:border-t-0">
      <td className="px-6 py-4">
        <WorkspaceIdentity subscription={subscription} />
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-bold text-content">
          {subscription.offer.name}
        </p>
        <p className="mt-0.5 text-xs text-content-muted">
          {subscription.offer.key}
        </p>
      </td>
      <td className="px-5 py-4">
        <StatusLabel status={subscription.status} />
      </td>
      <td className="px-5 py-4 text-sm font-semibold text-content">
        {formatPrice(subscription.price)}
      </td>
      <td className="px-6 py-4 text-sm text-content-muted">
        {formatOptionalDate(subscription.renewalDate)}
      </td>
    </tr>
  );
}

function SubscriptionCard({
  subscription,
}: {
  subscription: PlatformSubscription;
}) {
  return (
    <article className="p-5">
      <div className="flex items-start justify-between gap-3">
        <WorkspaceIdentity subscription={subscription} />
        <StatusLabel status={subscription.status} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <Datum label="Offre" value={subscription.offer.name} />
        <Datum label="Prix" value={formatPrice(subscription.price)} />
        <Datum
          label="Renouvellement"
          value={formatOptionalDate(subscription.renewalDate)}
        />
      </dl>
    </article>
  );
}

function WorkspaceIdentity({
  subscription,
}: {
  subscription: PlatformSubscription;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-content">
        {subscription.workspace.displayName}
      </p>
      <p className="mt-0.5 truncate text-xs text-content-muted">
        {subscription.workspace.slug}
      </p>
    </div>
  );
}

function StatusLabel({ status }: { status: SubscriptionStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-bold ${style.className}`}
    >
      {style.label}
    </span>
  );
}

function Datum({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-content-muted">{label}</dt>
      <dd className="mt-1 font-bold text-content">{value}</dd>
    </div>
  );
}

function PaginationButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: "chevronLeft" | "chevronRight";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-pgys-md border border-border text-content disabled:opacity-40"
    >
      <Icon name={icon} size="sm" />
    </button>
  );
}

function SubscriptionError({ message }: { message: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="font-bold text-content">Chargement impossible</p>
      <p className="mt-2 text-sm text-content-muted">{message}</p>
    </div>
  );
}

function SubscriptionLoading() {
  return (
    <div aria-label="Chargement des abonnements" className="grid gap-px bg-border">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-4 bg-surface px-6 py-5">
          <span className="h-4 w-48 animate-pulse rounded bg-surface-muted" />
          <span className="h-4 w-28 animate-pulse rounded bg-surface-muted" />
        </div>
      ))}
    </div>
  );
}

function formatPrice(price: PlatformSubscription["price"]) {
  if (!price) return "Non renseigné";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: price.currency,
  }).format(Number(price.amount));
}

function formatOptionalDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("fr-FR").format(new Date(value))
    : "Non renseigné";
}
