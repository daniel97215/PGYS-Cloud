import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { PortalShell } from "@/components/portal-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();

  if (
    !cookieStore.has("pgys_platform_access") &&
    !cookieStore.has("pgys_platform_refresh")
  ) {
    redirect("/login");
  }

  return (
    <>
      <a
        href="#portal-content"
        className="sr-only z-50 rounded-pgys-md bg-brand px-4 py-3 text-sm font-bold text-white focus:fixed focus:left-4 focus:top-4 focus:not-sr-only"
      >
        Aller au contenu principal
      </a>
      <PortalShell>{children}</PortalShell>
    </>
  );
}
