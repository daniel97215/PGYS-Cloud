"use client";

import { FormEvent, useState } from "react";
import { Button, Input, Textarea } from "@pgys/ui";

type FormState = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = event.currentTarget;
    const response = await fetch("/api/contact", { method: "POST", body: new FormData(form) });
    if (response.ok) {
      form.reset();
      setState("success");
    } else {
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2"><Input id="name" name="name" label="Nom" required maxLength={100} autoComplete="name" /><Input id="company" name="company" label="Entreprise" maxLength={120} autoComplete="organization" /></div>
      <div className="grid gap-5 sm:grid-cols-2"><Input id="email" name="email" label="Email" type="email" required maxLength={160} autoComplete="email" /><Input id="phone" name="phone" label="Téléphone" type="tel" maxLength={30} autoComplete="tel" /></div>
      <div className="grid gap-2"><label htmlFor="need" className="text-sm font-semibold text-slate-900">Votre besoin *</label><select id="need" name="need" required className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"><option value="">Sélectionnez un besoin</option><option>Cloud privé</option><option>Application métier</option><option>Hébergement</option><option>Maintenance ou sauvegardes</option><option>Autre projet</option></select></div>
      <Textarea id="message" name="message" label="Message" required rows={5} maxLength={2000} placeholder="Décrivez votre besoin, vos objectifs ou vos contraintes…" />
      <div className="hidden" aria-hidden="true"><label htmlFor="website">Site web</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <Button type="submit" size="lg" disabled={state === "sending"} className="bg-orange-500 hover:bg-orange-600">{state === "sending" ? "Envoi en cours…" : "Envoyer ma demande"}</Button>
      <p aria-live="polite" className={state === "error" ? "text-sm font-semibold text-red-700" : "text-sm font-semibold text-emerald-700"}>{state === "success" ? "Merci, votre demande a bien été envoyée." : state === "error" ? "L’envoi a échoué. Vous pouvez réessayer ou écrire à contact@pgys.fr." : "Les champs marqués d’un astérisque sont obligatoires."}</p>
    </form>
  );
}

