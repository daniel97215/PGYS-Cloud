"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

interface ClientShellProps {
  children: ReactNode;
}

export function ClientShell({ children }: ClientShellProps) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.assign("/login");
  }

  return (
    <div className="min-h-dvh bg-background pb-24">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-surface/95 px-4 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-brand">
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-sm font-black text-white" aria-hidden="true">P</span>
            <span className="font-black tracking-[-0.03em] text-content">PGYS <span className="text-accent">Espace client</span></span>
          </Link>
          <form action="/api/auth/logout" method="post" onSubmit={logout}>
            <button
              type="submit"
              disabled={loggingOut}
              className="min-h-11 rounded-xl px-3 text-sm font-bold text-content-muted hover:bg-surface-muted disabled:opacity-60"
            >
              {loggingOut ? "Déconnexion…" : "Déconnexion"}
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>

      <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <div className="mx-auto grid max-w-sm grid-cols-2 gap-2">
          <NavLink href="/" active={pathname === "/"} label="Accueil" icon="⌂" />
          <NavLink href="/workspaces" active={pathname === "/workspaces"} label="Espaces" icon="◇" />
        </div>
      </nav>
    </div>
  );
}

function NavLink({ href, active, label, icon }: { href: string; active: boolean; label: string; icon: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`grid min-h-14 place-items-center rounded-2xl text-xs font-bold transition-colors ${active ? "bg-brand-soft text-brand-dark" : "text-content-muted hover:bg-surface-muted"}`}
    >
      <span className="text-lg leading-none" aria-hidden="true">{icon}</span>
      {label}
    </Link>
  );
}
