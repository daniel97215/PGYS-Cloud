"use client";

import { useEffect, useState } from "react";
import { ClientShell } from "./client-shell";

interface Workspace {
  id: string;
  displayName: string;
  legalName: string | null;
  city: string | null;
  country: string | null;
  activity: string | null;
  status: string;
}

type ListState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; items: Workspace[] };

export function WorkspaceSelector() {
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [selectingId, setSelectingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const response = await fetch("/api/workspaces", { cache: "no-store" }).catch(() => null);
      if (!active) return;
      if (!response) {
        setState({ status: "error", message: "Aucune connexion réseau. Vérifiez votre accès puis réessayez." });
        return;
      }
      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (!response.ok) {
        setState({ status: "error", message: "La liste de vos espaces est momentanément indisponible." });
        return;
      }
      setState({ status: "ready", items: (await response.json()) as Workspace[] });
    }

    void load();
    return () => { active = false; };
  }, []);

  async function select(event: React.FormEvent<HTMLFormElement>, workspaceId: string) {
    event.preventDefault();
    setSelectingId(workspaceId);
    const response = await fetch("/api/workspaces/select", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    }).catch(() => null);

    if (response?.ok) {
      window.location.assign("/");
      return;
    }
    if (response?.status === 401) {
      window.location.assign("/login");
      return;
    }
    setState({ status: "error", message: response ? "Cet espace ne vous est plus accessible." : "La sélection n’a pas pu être confirmée. Vérifiez votre connexion." });
    setSelectingId(null);
  }

  return (
    <ClientShell>
      <header>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-brand">Contexte de travail</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-content">Choisissez votre Workspace</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-content-muted">Seuls les espaces auxquels votre compte a accès sont proposés.</p>
      </header>

      {state.status === "loading" ? <p role="status" className="mt-10 text-sm font-semibold text-content-muted">Chargement de vos espaces…</p> : null}
      {state.status === "error" ? (
        <div role="alert" className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-900">
          {state.message}
          <button type="button" onClick={() => window.location.reload()} className="mt-4 block min-h-11 rounded-xl bg-red-700 px-4 text-white">Réessayer</button>
        </div>
      ) : null}
      {state.status === "ready" && state.items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-border bg-surface p-6">
          <h2 className="text-lg font-black text-content">Aucun Workspace disponible</h2>
          <p className="mt-2 text-sm leading-6 text-content-muted">Demandez à un administrateur de votre entreprise de vous inviter dans un Workspace.</p>
        </div>
      ) : null}
      {state.status === "ready" && state.items.length > 0 ? (
        <ul className="mt-7 grid gap-4">
          {state.items.map((workspace) => {
            const location = [workspace.city, workspace.country].filter(Boolean).join(" · ");
            return (
              <li key={workspace.id}>
                <form action="/api/workspaces/select" method="post" onSubmit={(event) => select(event, workspace.id)}>
                  <input type="hidden" name="workspaceId" value={workspace.id} />
                <button
                  type="submit"
                  disabled={selectingId !== null}
                  className="group flex min-h-24 w-full items-center gap-4 rounded-3xl border border-border bg-surface p-5 text-left shadow-pgys-sm transition hover:border-brand/40 hover:shadow-pgys-card focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-lg font-black text-brand-dark" aria-hidden="true">{workspace.displayName.slice(0, 1).toUpperCase()}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-black text-content">{workspace.displayName}</span>
                    <span className="mt-1 block truncate text-sm text-content-muted">{workspace.activity ?? (location || "Entreprise")}</span>
                  </span>
                  <span className="text-xl text-brand transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                  {selectingId === workspace.id ? <span className="sr-only">Sélection en cours</span> : null}
                </button>
                </form>
              </li>
            );
          })}
        </ul>
      ) : null}
    </ClientShell>
  );
}
