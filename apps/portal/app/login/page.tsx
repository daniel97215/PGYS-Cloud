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
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    if (response.ok) {
      window.location.assign("/workspaces");
      return;
    }

    setError("Connexion refusée. Vérifiez votre compte opérateur PGYS.");
    setPending(false);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-10">
      <section className="w-full max-w-md rounded-pgys-xl border border-border bg-surface p-7 shadow-pgys-elevated sm:p-9">
        <div className="mb-8">
          <p className="text-xl font-black tracking-tight text-brand">
            PGYS <span className="text-[#ff7900]">Administration</span>
          </p>
          <h1 className="mt-7 text-3xl font-black tracking-[-0.035em] text-content">
            Connexion opérateur
          </h1>
          <p className="mt-3 text-sm leading-6 text-content-muted">
            Cet espace est réservé aux opérateurs internes autorisés par PGYS.
          </p>
        </div>

        <form className="grid gap-5" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-bold text-content">
            Adresse e-mail
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              className="min-h-12 rounded-pgys-md border border-border bg-surface px-3.5 text-base font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-content">
            Mot de passe
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="min-h-12 rounded-pgys-md border border-border bg-surface px-3.5 text-base font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </label>
          {error ? (
            <p role="alert" className="text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-1 min-h-12 rounded-pgys-md bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}
