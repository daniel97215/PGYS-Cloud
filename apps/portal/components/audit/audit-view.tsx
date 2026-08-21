"use client";

import { FormEvent, useEffect, useState } from "react";
import { Icon } from "@pgys/ui";

type AuditAction =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "STATUS_CHANGED"
  | "MEMBER_INVITED"
  | "MEMBER_REVOKED"
  | "ROLE_CHANGED"
  | "SERVICE_CONFIG_CHANGED";

interface PlatformAuditEntry {
  id: string;
  action: AuditAction;
  workspace: { id: string; displayName: string; slug: string };
  actor: { id: string; displayName: string; email: string } | null;
  targetType: string;
  targetId: string | null;
  metadataAvailable: boolean;
  createdAt: string;
}

interface AuditPage {
  items: PlatformAuditEntry[];
  total: number;
  page: number;
  pageSize: number;
  accessRole: "PLATFORM_ADMIN" | "PLATFORM_SUPPORT";
}

const ACTIONS: Array<{ label: string; value: AuditAction | "" }> = [
  { label: "Toutes les actions", value: "" },
  { label: "Création", value: "CREATED" },
  { label: "Modification", value: "UPDATED" },
  { label: "Suppression", value: "DELETED" },
  { label: "Changement de statut", value: "STATUS_CHANGED" },
  { label: "Invitation d’un membre", value: "MEMBER_INVITED" },
  { label: "Révocation d’un membre", value: "MEMBER_REVOKED" },
  { label: "Changement de rôle", value: "ROLE_CHANGED" },
  { label: "Configuration d’un service", value: "SERVICE_CONFIG_CHANGED" },
];

const ACTION_LABELS = Object.fromEntries(
  ACTIONS.filter((item) => item.value).map((item) => [item.value, item.label]),
) as Record<AuditAction, string>;

export function AuditView() {
  const [data, setData] = useState<AuditPage | null>(null);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [action, setAction] = useState<AuditAction | "">("");
  const [page, setPage] = useState(1);
  const [requestSequence, setRequestSequence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (submittedSearch) query.set("search", submittedSearch);
    if (action) query.set("action", action);

    fetch(`/api/platform/audit?${query.toString()}`, {
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
            body?.message ?? "Impossible de charger le journal d’audit",
          );
        }
        return (await response.json()) as AuditPage;
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
  }, [action, page, requestSequence, submittedSearch]);

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
            Journal d’audit
          </h1>
          <p className="mt-3 text-base leading-7 text-content-muted">
            Consultez les actions sensibles enregistrées sur la plateforme.
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
          <span className="sr-only">Rechercher dans le journal</span>
          <span className="pointer-events-none absolute inset-y-0 left-3.5 grid place-items-center text-content-muted">
            <Icon name="search" size="sm" />
          </span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Société, acteur ou cible"
            className="min-h-12 w-full rounded-pgys-md border border-border bg-surface pl-11 pr-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>
        <label>
          <span className="sr-only">Filtrer par action</span>
          <select
            value={action}
            onChange={(event) => {
              setLoading(true);
              setError(null);
              setAction(event.target.value as AuditAction | "");
              setPage(1);
            }}
            className="min-h-12 w-full rounded-pgys-md border border-border bg-surface px-4 text-sm font-semibold outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 sm:w-64"
          >
            {ACTIONS.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </form>

      <section
        aria-label="Entrées du journal d’audit"
        className="mt-7 overflow-hidden rounded-pgys-lg border border-border bg-surface shadow-pgys-sm"
      >
        {error ? <LoadError message={error} /> : null}
        {!error && loading ? <AuditLoading /> : null}
        {!error && !loading && data?.items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-bold text-content">Aucune entrée trouvée</p>
            <p className="mt-2 text-sm text-content-muted">
              Modifiez la recherche ou l’action sélectionnée.
            </p>
          </div>
        ) : null}

        {!error && !loading && data?.items.length ? (
          <>
            <div className="hidden lg:block">
              <table className="w-full border-collapse text-left">
                <thead className="bg-surface-muted text-xs font-bold uppercase tracking-wide text-content-muted">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-5 py-4">Société</th>
                    <th className="px-5 py-4">Action</th>
                    <th className="px-5 py-4">Cible</th>
                    <th className="px-6 py-4">Acteur</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((entry) => (
                    <AuditTableRow key={entry.id} entry={entry} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-border lg:hidden">
              {data.items.map((entry) => (
                <AuditCard key={entry.id} entry={entry} />
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
              <PageButton
                label="Page précédente"
                icon="chevronLeft"
                disabled={data.page <= 1 || loading}
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  setPage((current) => Math.max(1, current - 1));
                }}
              />
              <PageButton
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

function AuditTableRow({ entry }: { entry: PlatformAuditEntry }) {
  return (
    <tr className="border-t border-border first:border-t-0">
      <td className="whitespace-nowrap px-6 py-4 text-sm text-content-muted">
        {formatDateTime(entry.createdAt)}
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-bold text-content">
          {entry.workspace.displayName}
        </p>
        <p className="mt-0.5 text-xs text-content-muted">
          {entry.workspace.slug}
        </p>
      </td>
      <td className="px-5 py-4">
        <ActionLabel action={entry.action} />
      </td>
      <td className="px-5 py-4 text-sm text-content">
        <p className="font-semibold">{entry.targetType}</p>
        <p className="mt-0.5 max-w-40 truncate text-xs text-content-muted">
          {entry.targetId ?? "Identifiant non renseigné"}
        </p>
      </td>
      <td className="px-6 py-4 text-sm text-content">
        <Actor entry={entry} />
      </td>
    </tr>
  );
}

function AuditCard({ entry }: { entry: PlatformAuditEntry }) {
  return (
    <article className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-content">{entry.workspace.displayName}</p>
          <p className="mt-1 text-xs text-content-muted">
            {formatDateTime(entry.createdAt)}
          </p>
        </div>
        <ActionLabel action={entry.action} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <Datum label="Cible" value={entry.targetType} />
        <Datum
          label="Acteur"
          value={entry.actor?.displayName ?? "Système"}
        />
      </dl>
    </article>
  );
}

function ActionLabel({ action }: { action: AuditAction }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full bg-brand-soft px-2.5 text-xs font-bold text-brand-dark">
      {ACTION_LABELS[action]}
    </span>
  );
}

function Actor({ entry }: { entry: PlatformAuditEntry }) {
  if (!entry.actor) return <span className="text-content-muted">Système</span>;
  return (
    <div>
      <p className="font-semibold">{entry.actor.displayName}</p>
      <p className="mt-0.5 text-xs text-content-muted">{entry.actor.email}</p>
    </div>
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

function PageButton({
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

function LoadError({ message }: { message: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="font-bold text-content">Chargement impossible</p>
      <p className="mt-2 text-sm text-content-muted">{message}</p>
    </div>
  );
}

function AuditLoading() {
  return (
    <div aria-label="Chargement du journal" className="grid gap-px bg-border">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-4 bg-surface px-6 py-5">
          <span className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
          <span className="h-4 w-48 animate-pulse rounded bg-surface-muted" />
        </div>
      ))}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
