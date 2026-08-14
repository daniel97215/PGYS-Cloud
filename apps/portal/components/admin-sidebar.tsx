import { Badge, Logo } from "@pgys/ui";
import type { AdminNavigationItem } from "@/lib/admin";
import { PortalNavigation } from "./portal-navigation";

type AdminSidebarProps = {
  navigation: readonly AdminNavigationItem[];
};

export function AdminSidebar({ navigation }: AdminSidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen border-r border-border bg-surface lg:flex lg:flex-col">
      <div className="flex min-h-20 items-center border-b border-border px-6">
        <Logo href="/" homeLabel="PGYS, administration interne" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <p className="mb-5 px-3 text-xs font-bold uppercase tracking-[0.16em] text-brand-dark">
          Administration PGYS
        </p>
        <PortalNavigation
          items={navigation}
          label="Navigation du portail opérateur"
        />
      </div>
      <div className="border-t border-border p-5">
        <div className="rounded-pgys-lg bg-surface-muted p-4">
          <Badge variant="brand">Accès interne</Badge>
          <p className="mt-3 text-xs leading-5 text-content-muted">
            Ce portail est distinct de l’administration limitée à chaque
            workspace client.
          </p>
        </div>
      </div>
    </aside>
  );
}
