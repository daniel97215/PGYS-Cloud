"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type {
  BusinessPartner,
  BusinessPartnerSearchResult,
} from "@/lib/crm";
import { partnerTypeLabels } from "@/lib/crm";
import { ClientShell } from "../client-shell";

type SearchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; result: BusinessPartnerSearchResult };

export function CrmPartnerList() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState<SearchState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function load() {
      const params = new URLSearchParams({ page: String(page) });
      if (activeQuery) params.set("name", activeQuery);
      const response = await fetch(`/api/crm/partners?${params.toString()}`, {
        cache: "no-store",
      }).catch(() => null);

      if (!active) return;
      if (!response) {
        setState({ status: "error", message: "Connexion réseau indisponible. Vérifiez votre accès." });
        return;
      }
      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (response.status === 409) {
        window.location.assign("/workspaces");
        return;
      }
      if (!response.ok) {
        setState({ status: "error", message: "La recherche CRM est momentanément indisponible." });
        return;
      }
      setState({ status: "ready", result: (await response.json()) as BusinessPartnerSearchResult });
    }

    void load();
    return () => { active = false; };
  }, [activeQuery, page, refreshKey]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    setState({ status: "loading" });
    setPage(1);
    setActiveQuery(nextQuery);
    if (page === 1 && activeQuery === nextQuery) {
      setRefreshKey((key) => key + 1);
    }
  }

  function clearSearch() {
    setState({ status: "loading" });
    setQuery("");
    setPage(1);
    setActiveQuery("");
  }

  return (
    <ClientShell>
      <div className="grid gap-6">
        <header>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brand">
            CRM terrain
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-content">
            Business Partners
          </h1>
          <p className="mt-3 text-sm leading-6 text-content-muted">
            Retrouvez rapidement un client, prospect ou partenaire avant votre
            prochain échange.
          </p>
        </header>

        <form className="flex gap-2" onSubmit={submit} role="search">
          <label className="sr-only" htmlFor="partner-search">
            Rechercher par nom
          </label>
          <input
            id="partner-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={160}
            placeholder="Nom ou raison sociale"
            className="min-h-12 min-w-0 flex-1 rounded-2xl border border-border bg-surface px-4 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
          <button
            type="submit"
            className="min-h-12 shrink-0 rounded-2xl bg-brand px-5 text-sm font-black text-white hover:bg-brand-dark"
          >
            Chercher
          </button>
        </form>

        {activeQuery ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand-dark">
            <span className="min-w-0 truncate font-bold">
              Résultats pour « {activeQuery} »
            </span>
            <button
              type="button"
              onClick={clearSearch}
              className="min-h-11 shrink-0 rounded-xl px-3 font-black hover:bg-white/60"
            >
              Effacer
            </button>
          </div>
        ) : null}

        {state.status === "loading" ? (
          <p role="status" className="py-10 text-center text-sm font-semibold text-content-muted">
            Recherche des Business Partners…
          </p>
        ) : null}
        {state.status === "error" ? (
          <section role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-900">
            <p className="text-sm font-semibold leading-6">{state.message}</p>
            <button
              type="button"
              onClick={() => {
                setState({ status: "loading" });
                setRefreshKey((key) => key + 1);
              }}
              className="mt-4 min-h-11 rounded-xl bg-red-700 px-4 text-sm font-bold text-white"
            >
              Réessayer
            </button>
          </section>
        ) : null}
        {state.status === "ready" ? (
          <PartnerResults
            result={state.result}
            page={page}
            onPageChange={(nextPage) => {
              setState({ status: "loading" });
              setPage(nextPage);
            }}
          />
        ) : null}
      </div>
    </ClientShell>
  );
}

function PartnerResults({
  result,
  page,
  onPageChange,
}: {
  result: BusinessPartnerSearchResult;
  page: number;
  onPageChange: (page: number) => void;
}) {
  if (result.items.length === 0) {
    return (
      <section className="rounded-3xl border border-border bg-surface p-6">
        <h2 className="text-lg font-black text-content">Aucun résultat</h2>
        <p className="mt-2 text-sm leading-6 text-content-muted">
          Essayez avec un nom plus court ou vérifiez le Workspace sélectionné.
        </p>
      </section>
    );
  }

  const hasNext = page * result.pageSize < result.total;

  return (
    <section aria-labelledby="partner-results-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="partner-results-title" className="text-sm font-black text-content">
          {result.total} Business Partner{result.total > 1 ? "s" : ""}
        </h2>
        <span className="text-xs font-semibold text-content-muted">
          Page {result.page}
        </span>
      </div>
      <ul className="mt-4 grid gap-3">
        {result.items.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </ul>
      {page > 1 || hasNext ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="min-h-11 rounded-xl border border-border bg-surface px-4 text-sm font-bold text-content disabled:opacity-40"
          >
            Précédent
          </button>
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => onPageChange(page + 1)}
            className="min-h-11 rounded-xl border border-border bg-surface px-4 text-sm font-bold text-content disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      ) : null}
    </section>
  );
}

function PartnerCard({ partner }: { partner: BusinessPartner }) {
  const contact = partner.contacts?.find(({ isPrimary }) => isPrimary) ?? partner.contacts?.[0];

  return (
    <li>
      <Link
        href={`/crm/partners/${encodeURIComponent(partner.code)}`}
        className="group flex min-h-24 items-center gap-4 rounded-3xl border border-border bg-surface p-4 shadow-pgys-sm transition hover:border-brand/40 hover:shadow-pgys-card focus-visible:outline-2 focus-visible:outline-brand"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-lg font-black text-brand-dark" aria-hidden="true">
          {partner.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-black text-content">{partner.name}</span>
          <span className="mt-1 block truncate text-sm text-content-muted">
            {partnerTypeLabels[partner.type] ?? partner.type} · {partner.code}
          </span>
          {contact ? (
            <span className="mt-1 block truncate text-xs font-semibold text-content-muted">
              {contact.firstName} {contact.lastName}
            </span>
          ) : null}
        </span>
        <span className="text-xl text-brand transition-transform group-hover:translate-x-1" aria-hidden="true">
          →
        </span>
      </Link>
    </li>
  );
}
