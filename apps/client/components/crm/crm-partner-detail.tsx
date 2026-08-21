"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  CRM_ACTIVITY_TYPES,
  activityStatusLabels,
  activityTypeLabels,
  partnerTypeLabels,
} from "@/lib/crm";
import type {
  BusinessPartnerContact,
  BusinessPartnerDetailResult,
  CrmActivity,
} from "@/lib/crm";
import { ClientShell } from "../client-shell";

type DetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: BusinessPartnerDetailResult };

export function CrmPartnerDetail({ code }: { code: string }) {
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      const response = await fetch(`/api/crm/partners/${encodeURIComponent(code)}`, { cache: "no-store" }).catch(() => null);
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
      if (response.status === 404) {
        setState({ status: "error", message: "Ce Business Partner est introuvable." });
        return;
      }
      if (!response.ok) {
        setState({ status: "error", message: "La fiche CRM est momentanément indisponible." });
        return;
      }
      setState({ status: "ready", data: (await response.json()) as BusinessPartnerDetailResult });
    }

    void load();
    return () => { active = false; };
  }, [code, refreshKey]);

  function activityCreated(activity: CrmActivity) {
    setState((current) =>
      current.status === "ready"
        ? {
            status: "ready",
            data: {
              ...current.data,
              activities: [activity, ...current.data.activities],
            },
          }
        : current,
    );
    setShowActivityForm(false);
  }

  function activityCompleted(activity: CrmActivity) {
    setState((current) =>
      current.status === "ready"
        ? {
            status: "ready",
            data: {
              ...current.data,
              activities: current.data.activities.map((item) =>
                item.id === activity.id ? activity : item,
              ),
            },
          }
        : current,
    );
  }

  return (
    <ClientShell>
      {state.status === "loading" ? (
        <p role="status" className="py-16 text-center text-sm font-semibold text-content-muted">
          Chargement de la fiche CRM…
        </p>
      ) : null}
      {state.status === "error" ? (
        <section role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900">
          <h1 className="text-xl font-black">Fiche indisponible</h1>
          <p className="mt-2 text-sm leading-6">{state.message}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => {
              setState({ status: "loading" });
              setRefreshKey((key) => key + 1);
            }} className="min-h-11 rounded-xl bg-red-700 px-4 text-sm font-bold text-white">
              Réessayer
            </button>
            <Link href="/crm" className="min-h-11 rounded-xl px-4 py-3 text-sm font-bold text-red-800">
              Retour au CRM
            </Link>
          </div>
        </section>
      ) : null}
      {state.status === "ready" ? (
        <div className="grid gap-7">
          <PartnerHeader data={state.data} />
          <ContactSection contacts={state.data.contacts} />
          <section aria-labelledby="activities-title">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand">Suivi terrain</p>
                <h2 id="activities-title" className="mt-1 text-2xl font-black tracking-[-0.03em] text-content">Activités CRM</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowActivityForm((visible) => !visible)}
                aria-expanded={showActivityForm}
                className="min-h-11 rounded-xl bg-brand px-4 text-sm font-black text-white hover:bg-brand-dark"
              >
                {showActivityForm ? "Fermer" : "Nouvelle"}
              </button>
            </div>
            {showActivityForm ? (
              <ActivityForm
                businessPartnerId={state.data.partner.id}
                contacts={state.data.contacts}
                onCreated={activityCreated}
              />
            ) : null}
            <ActivityList
              activities={state.data.activities}
              contacts={state.data.contacts}
              onCompleted={activityCompleted}
            />
          </section>
        </div>
      ) : null}
    </ClientShell>
  );
}

function PartnerHeader({ data }: { data: BusinessPartnerDetailResult }) {
  const { partner } = data;
  return (
    <header>
      <Link href="/crm" className="inline-flex min-h-11 items-center rounded-xl pr-3 text-sm font-bold text-brand hover:bg-brand-soft">
        ← Retour aux Business Partners
      </Link>
      <div className="mt-3 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-dark via-brand to-[#2074df] p-6 text-white shadow-pgys-brand sm:p-8">
        <p className="text-sm font-bold text-blue-100">
          {partnerTypeLabels[partner.type] ?? partner.type} · {partner.code}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{partner.name}</h1>
        {partner.legalName && partner.legalName !== partner.name ? (
          <p className="mt-2 text-sm text-blue-100">{partner.legalName}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-black uppercase tracking-wider">
          <span className="rounded-full bg-white/15 px-3 py-2">
            {partner.status === "active" ? "Actif" : partner.status}
          </span>
          <span className="rounded-full bg-white/15 px-3 py-2">
            {data.contacts.length} contact{data.contacts.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </header>
  );
}

function ContactSection({ contacts }: { contacts: BusinessPartnerContact[] }) {
  return (
    <section aria-labelledby="contacts-title">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-brand">Interlocuteurs</p>
      <h2 id="contacts-title" className="mt-1 text-2xl font-black tracking-[-0.03em] text-content">Contacts</h2>
      {contacts.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-border bg-surface p-5 text-sm text-content-muted">Aucun contact actif renseigné.</p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {contacts.map((contact) => (
            <li key={contact.id} className="rounded-2xl border border-border bg-surface p-4 shadow-pgys-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-black text-content">{contact.firstName} {contact.lastName}</p>
                  <p className="mt-1 truncate text-sm text-content-muted">{contact.jobTitle ?? "Contact"}</p>
                </div>
                {contact.isPrimary ? <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[0.65rem] font-black uppercase text-brand-dark">Principal</span> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {contact.mobile || contact.phone ? (
                  <a href={`tel:${contact.mobile ?? contact.phone}`} className="inline-flex min-h-11 items-center rounded-xl bg-brand-soft px-3 text-sm font-bold text-brand-dark">Appeler</a>
                ) : null}
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center rounded-xl bg-surface-muted px-3 text-sm font-bold text-content">E-mail</a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActivityForm({
  businessPartnerId,
  contacts,
  onCreated,
}: {
  businessPartnerId: string;
  contacts: BusinessPartnerContact[];
  onCreated: (activity: CrmActivity) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const scheduledAt = form.get("scheduledAt");
    const response = await fetch("/api/crm/activities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        businessPartnerId,
        type: form.get("type"),
        title: form.get("title"),
        description: form.get("description"),
        contactId: form.get("contactId"),
        ...(typeof scheduledAt === "string" && scheduledAt
          ? { scheduledAt: new Date(scheduledAt).toISOString() }
          : {}),
      }),
    }).catch(() => null);

    if (response?.ok) {
      onCreated((await response.json()) as CrmActivity);
      return;
    }
    if (response?.status === 401) {
      window.location.assign("/login");
      return;
    }
    setError(response ? "L’activité n’a pas pu être enregistrée." : "Connexion réseau indisponible.");
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="mt-5 grid gap-4 rounded-3xl border border-brand/20 bg-brand-soft/50 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-content">
          Type
          <select name="type" required defaultValue="CALL" className="min-h-12 rounded-xl border border-border bg-surface px-3 text-base font-normal outline-none focus:border-brand">
            {CRM_ACTIVITY_TYPES.map((type) => <option key={type} value={type}>{activityTypeLabels[type]}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-content">
          Contact associé
          <select name="contactId" defaultValue="" className="min-h-12 rounded-xl border border-border bg-surface px-3 text-base font-normal outline-none focus:border-brand">
            <option value="">Aucun contact</option>
            {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.firstName} {contact.lastName}</option>)}
          </select>
        </label>
      </div>
      <label className="grid gap-2 text-sm font-bold text-content">
        Titre
        <input name="title" required maxLength={160} className="min-h-12 rounded-xl border border-border bg-surface px-3 text-base font-normal outline-none focus:border-brand" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-content">
        Planification
        <input name="scheduledAt" type="datetime-local" className="min-h-12 rounded-xl border border-border bg-surface px-3 text-base font-normal outline-none focus:border-brand" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-content">
        Notes
        <textarea name="description" maxLength={2000} rows={3} className="rounded-xl border border-border bg-surface px-3 py-3 text-base font-normal outline-none focus:border-brand" />
      </label>
      {error ? <p role="alert" className="text-sm font-semibold text-red-800">{error}</p> : null}
      <button type="submit" disabled={pending} className="min-h-12 rounded-xl bg-brand px-5 text-sm font-black text-white hover:bg-brand-dark disabled:opacity-60">
        {pending ? "Enregistrement…" : "Enregistrer l’activité"}
      </button>
    </form>
  );
}

function ActivityList({
  activities,
  contacts,
  onCompleted,
}: {
  activities: CrmActivity[];
  contacts: BusinessPartnerContact[];
  onCompleted: (activity: CrmActivity) => void;
}) {
  if (activities.length === 0) {
    return <p className="mt-5 rounded-2xl border border-border bg-surface p-5 text-sm text-content-muted">Aucune activité CRM pour ce Business Partner.</p>;
  }

  const contactNames = new Map(contacts.map((contact) => [contact.id, `${contact.firstName} ${contact.lastName}`]));

  return (
    <ul className="mt-5 grid gap-3">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} contactName={activity.contactId ? contactNames.get(activity.contactId) : undefined} onCompleted={onCompleted} />
      ))}
    </ul>
  );
}

function ActivityCard({
  activity,
  contactName,
  onCompleted,
}: {
  activity: CrmActivity;
  contactName?: string;
  onCompleted: (activity: CrmActivity) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function complete() {
    setPending(true);
    setError(false);
    const response = await fetch(`/api/crm/activities/${activity.id}/complete`, { method: "POST" }).catch(() => null);
    if (response?.ok) {
      onCompleted((await response.json()) as CrmActivity);
      return;
    }
    if (response?.status === 401) {
      window.location.assign("/login");
      return;
    }
    setPending(false);
    setError(true);
  }

  return (
    <li className="rounded-2xl border border-border bg-surface p-4 shadow-pgys-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-black text-content">{activity.title}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-content-muted">
            {activityTypeLabels[activity.type]} · {activityStatusLabels[activity.status]}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-black uppercase ${activity.status === "PLANNED" ? "bg-amber-100 text-amber-800" : activity.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
          {activityStatusLabels[activity.status]}
        </span>
      </div>
      {activity.description ? <p className="mt-3 text-sm leading-6 text-content-muted">{activity.description}</p> : null}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-content-muted">
        {activity.scheduledAt ? <span>{formatDate(activity.scheduledAt)}</span> : <span>Non planifiée</span>}
        {contactName ? <span>{contactName}</span> : null}
      </div>
      {activity.status === "PLANNED" ? (
        <button type="button" onClick={complete} disabled={pending} className="mt-4 min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60">
          {pending ? "Validation…" : "Marquer terminée"}
        </button>
      ) : null}
      {error ? <p role="alert" className="mt-3 text-sm font-semibold text-red-800">La transition n’a pas pu être confirmée.</p> : null}
    </li>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
