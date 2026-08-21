"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    }).catch(() => null);

    if (response?.ok) {
      window.location.assign("/workspaces");
      return;
    }

    setError(response ? "Connexion refusée. Vérifiez votre adresse e-mail et votre mot de passe." : "Connexion réseau indisponible. Réessayez dans quelques instants.");
    setPending(false);
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#f3f7fd] px-4 py-10">
      <div className="absolute -right-24 -top-24 size-72 rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 -left-24 size-80 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
      <section className="relative w-full max-w-md rounded-[2rem] border border-white/80 bg-surface p-6 shadow-pgys-elevated sm:p-9">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-brand text-base font-black text-white" aria-hidden="true">P</span>
          <p className="text-lg font-black tracking-[-0.03em] text-content">PGYS <span className="text-accent">Espace client</span></p>
        </div>
        <h1 className="mt-10 text-3xl font-black tracking-[-0.04em] text-content">Bon retour parmi nous</h1>
        <p className="mt-3 text-sm leading-6 text-content-muted">Connectez-vous pour retrouver les espaces de votre entreprise.</p>

        <form action="/api/auth/login" method="post" className="mt-8 grid gap-5" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-bold text-content">
            Adresse e-mail
            <input name="email" type="email" autoComplete="username" required className="min-h-12 rounded-xl border border-border bg-surface px-3.5 text-base font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-content">
            Mot de passe
            <input name="password" type="password" autoComplete="current-password" required className="min-h-12 rounded-xl border border-border bg-surface px-3.5 text-base font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
          </label>
          {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold leading-5 text-red-800">{error}</p> : null}
          <button type="submit" disabled={pending} className="mt-1 min-h-12 rounded-xl bg-brand px-5 text-sm font-black text-white shadow-pgys-brand transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60">
            {pending ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}
