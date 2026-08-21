"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClientShell } from "./client-shell";

interface Workspace {
  id: string;
  displayName: string;
  legalName: string | null;
  activity: string | null;
  city: string | null;
  country: string | null;
  currency: string | null;
  timezone: string;
  status: string;
}

type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; workspace: Workspace };

export function WorkspaceHome() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function load() {
      const response = await fetch("/api/workspaces/current", { cache: "no-store" }).catch(() => null);
      if (!active) return;
      if (!response) {
        setState({ status: "error", message: "Connexion réseau indisponible. Vérifiez votre accès puis réessayez." });
        return;
      }
      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (response.status === 409 || response.status === 403 || response.status === 404) {
        window.location.assign("/workspaces");
        return;
      }
      if (!response.ok) {
        setState({ status: "error", message: "Votre espace ne peut pas être chargé pour le moment." });
        return;
      }
      setState({ status: "ready", workspace: (await response.json()) as Workspace });
    }

    void load();
    return () => { active = false; };
  }, []);

  return (
    <ClientShell>
      {state.status === "loading" ? <LoadingState /> : null}
      {state.status === "error" ? <ErrorState message={state.message} /> : null}
      {state.status === "ready" ? <WorkspaceView workspace={state.workspace} /> : null}
    </ClientShell>
  );
}

function LoadingState() {
  return <div role="status" className="grid min-h-[50vh] place-items-center text-sm font-semibold text-content-muted">Chargement de votre espace…</div>;
}

function ErrorState({ message }: { message: string }) {
  return (
    <section role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900">
      <h1 className="text-xl font-black">Accès momentanément indisponible</h1>
      <p className="mt-2 text-sm leading-6">{message}</p>
      <button type="button" onClick={() => window.location.reload()} className="mt-5 min-h-11 rounded-xl bg-red-700 px-4 text-sm font-bold text-white">Réessayer</button>
    </section>
  );
}

function WorkspaceView({ workspace }: { workspace: Workspace }) {
  const location = [workspace.city, workspace.country].filter(Boolean).join(" · ");

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-dark via-brand to-[#2074df] p-6 text-white shadow-pgys-brand sm:p-8">
        <p className="text-sm font-bold text-blue-100">Workspace actif</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{workspace.displayName}</h1>
        {workspace.legalName && workspace.legalName !== workspace.displayName ? <p className="mt-2 text-sm text-blue-100">{workspace.legalName}</p> : null}
        <span className="mt-6 inline-flex min-h-8 items-center rounded-full bg-white/15 px-3 text-xs font-black uppercase tracking-wider">{workspace.status === "ACTIVE" ? "Actif" : workspace.status}</span>
      </section>

      <section aria-labelledby="context-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand">Votre contexte</p>
            <h2 id="context-title" className="mt-1 text-2xl font-black tracking-[-0.03em] text-content">Repères de l’entreprise</h2>
          </div>
          <Link href="/workspaces" className="min-h-11 rounded-xl px-3 py-3 text-sm font-bold text-brand hover:bg-brand-soft">Changer</Link>
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <ContextItem label="Activité" value={workspace.activity ?? "Non renseignée"} />
          <ContextItem label="Localisation" value={location || "Non renseignée"} />
          <ContextItem label="Devise" value={workspace.currency ?? "Non renseignée"} />
          <ContextItem label="Fuseau horaire" value={workspace.timezone} />
        </dl>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-pgys-sm">
        <p className="text-sm font-bold text-content">Votre point d’entrée mobile est prêt.</p>
        <p className="mt-2 text-sm leading-6 text-content-muted">Les prochains parcours métier seront ajoutés ici à partir des usages réellement validés sur le terrain.</p>
      </section>
    </div>
  );
}

function ContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <dt className="text-xs font-bold uppercase tracking-wider text-content-muted">{label}</dt>
      <dd className="mt-2 break-words text-base font-black text-content">{value}</dd>
    </div>
  );
}
