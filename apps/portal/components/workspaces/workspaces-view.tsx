"use client";

import { FormEvent, useEffect, useState } from "react";
import { Icon } from "@pgys/ui";

type WorkspaceStatus =
  | "DRAFT"
  | "ACTIVE"
  | "SUSPENDED"
  | "CLOSING"
  | "CLOSED";

type PlatformRole = "PLATFORM_ADMIN" | "PLATFORM_SUPPORT";

interface PlatformWorkspace {
  id: string;
  displayName: string;
  slug: string;
  status: WorkspaceStatus;
  billingEmail: string | null;
  memberCount: number;
  serviceCount: number;
  createdAt: string;
  updatedAt: string;
}

interface WorkspacePage {
  items: PlatformWorkspace[];
  total: number;
  page: number;
  pageSize: number;
  accessRole: PlatformRole;
}

const STATUS_OPTIONS: Array<{ label: string; value: WorkspaceStatus | "" }> = [
  { label: "Tous les statuts", value: "" },
  { label: "Actif", value: "ACTIVE" },
  { label: "Suspendu", value: "SUSPENDED" },
  { label: "Brouillon", value: "DRAFT" },
  { label: "Fermeture en cours", value: "CLOSING" },
  { label: "Fermé", value: "CLOSED" },
];

const STATUS_STYLES: Record<
  WorkspaceStatus,
  { className: string; label: string }
> = {
  ACTIVE: { label: "Actif", className: "bg-emerald-50 text-emerald-800" },
  SUSPENDED: { label: "Suspendu", className: "bg-amber-50 text-amber-800" },
  DRAFT: { label: "Brouillon", className: "bg-blue-50 text-blue-800" },
  CLOSING: { label: "Fermeture", className: "bg-orange-50 text-orange-800" },
  CLOSED: { label: "Fermé", className: "bg-slate-100 text-slate-700" },
};

export function WorkspacesView() {
  const [data, setData] = useState<WorkspacePage | null>(null);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [status, setStatus] = useState<WorkspaceStatus | "">("");
  const [page, setPage] = useState(1);
  const [requestSequence, setRequestSequence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (submittedSearch) query.set("search", submittedSearch);
    if (status) query.set("status", status);

    fetch(`/api/platform/workspaces?${query.toString()}`, {
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
          throw new Error(body?.message ?? "Impossible de charger les workspaces");
        }
        return (await response.json()) as WorkspacePage;
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

  const firstItem = data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0;
  const lastItem = data
    ? Math.min(data.page * data.pageSize, data.total)
    : 0;
  const hasNext = data ? lastItem < data.total : false;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.035em] text-content sm:text-4xl">
            Workspaces
          </h1>
          <p className="mt-3 text-base leading-7 text-content-muted">
            Consultez les sociétés clientes et leur état sur la plateforme.
          </p>
        </div>
        {data?.accessRole === "PLATFORM_SUPPORT" ? (
          <span className="inline-flex min-h-9 self-start items-center gap-2 rounded-pgys-md border border-brand/30 px-3 text-sm font-bold text-brand-dark">
            <Icon name="eye" size="sm" />
            Lecture seule
          </span>
        ) : null}
      </div>

      <form
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        onSubmit={submitSearch}
      >
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Rechercher un workspace</span>
          <span className="pointer-events-none absolute inset-y-0 left-3.5 grid place-items-center text-content-muted">
            <Icon name="search" size="sm" />
          </span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un workspace"
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
              setStatus(event.target.value as WorkspaceStatus | "");
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
        aria-label="Liste des workspaces"
        className="mt-7 overflow-hidden rounded-pgys-lg border border-border bg-surface shadow-pgys-sm"
      >
        {error ? (
          <div className="px-6 py-12 text-center">
            <p className="font-bold text-content">Chargement impossible</p>
            <p className="mt-2 text-sm text-content-muted">{error}</p>
          </div>
        ) : null}

        {!error && loading ? <WorkspaceLoading /> : null}

        {!error && !loading && data?.items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-bold text-content">Aucun workspace trouvé</p>
            <p className="mt-2 text-sm text-content-muted">
              Modifiez la recherche ou le statut sélectionné.
            </p>
          </div>
        ) : null}

        {!error && !loading && data?.items.length ? (
          <>
            <div className="hidden md:block">
              <table className="w-full border-collapse text-left">
                <thead className="bg-surface-muted text-xs font-bold uppercase tracking-wide text-content-muted">
                  <tr>
                    <th className="px-6 py-4">Société</th>
                    <th className="px-5 py-4">Statut</th>
                    <th className="px-5 py-4">Membres</th>
                    <th className="px-5 py-4">Services</th>
                    <th className="px-6 py-4">Créé le</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((workspace) => (
                    <WorkspaceTableRow key={workspace.id} workspace={workspace} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-border md:hidden">
              {data.items.map((workspace) => (
                <WorkspaceMobileRow key={workspace.id} workspace={workspace} />
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
              <button
                type="button"
                aria-label="Page précédente"
                disabled={data.page <= 1 || loading}
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  setPage((current) => Math.max(1, current - 1));
                }}
                className="grid size-9 place-items-center rounded-pgys-md border border-border text-content disabled:opacity-40"
              >
                <Icon name="chevronLeft" size="sm" />
              </button>
              <button
                type="button"
                aria-label="Page suivante"
                disabled={!hasNext || loading}
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  setPage((current) => current + 1);
                }}
                className="grid size-9 place-items-center rounded-pgys-md border border-border text-content disabled:opacity-40"
              >
                <Icon name="chevronRight" size="sm" />
              </button>
            </div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}

function WorkspaceTableRow({ workspace }: { workspace: PlatformWorkspace }) {
  return (
    <tr className="border-t border-border first:border-t-0">
      <td className="px-6 py-4">
        <WorkspaceIdentity workspace={workspace} />
      </td>
      <td className="px-5 py-4">
        <WorkspaceStatusLabel status={workspace.status} />
      </td>
      <td className="px-5 py-4 text-sm font-semibold text-content">
        {workspace.memberCount}
      </td>
      <td className="px-5 py-4 text-sm font-semibold text-content">
        {workspace.serviceCount}
      </td>
      <td className="px-6 py-4 text-sm text-content-muted">
        {formatDate(workspace.createdAt)}
      </td>
    </tr>
  );
}

function WorkspaceMobileRow({ workspace }: { workspace: PlatformWorkspace }) {
  return (
    <article className="p-5">
      <div className="flex items-start justify-between gap-3">
        <WorkspaceIdentity workspace={workspace} />
        <WorkspaceStatusLabel status={workspace.status} />
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <WorkspaceDatum label="Membres" value={String(workspace.memberCount)} />
        <WorkspaceDatum label="Services" value={String(workspace.serviceCount)} />
        <WorkspaceDatum label="Créé le" value={formatDate(workspace.createdAt)} />
      </dl>
    </article>
  );
}

function WorkspaceIdentity({ workspace }: { workspace: PlatformWorkspace }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-black text-brand-dark">
        {initials(workspace.displayName)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-content">
          {workspace.displayName}
        </p>
        <p className="mt-0.5 truncate text-xs text-content-muted">
          {workspace.slug}
        </p>
      </div>
    </div>
  );
}

function WorkspaceStatusLabel({ status }: { status: WorkspaceStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-bold ${style.className}`}
    >
      {style.label}
    </span>
  );
}

function WorkspaceDatum({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-content-muted">{label}</dt>
      <dd className="mt-1 font-bold text-content">{value}</dd>
    </div>
  );
}

function WorkspaceLoading() {
  return (
    <div aria-label="Chargement des workspaces" className="grid gap-px bg-border">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-4 bg-surface px-6 py-5">
          <span className="size-10 animate-pulse rounded-full bg-surface-muted" />
          <span className="h-4 w-48 animate-pulse rounded bg-surface-muted" />
        </div>
      ))}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}
