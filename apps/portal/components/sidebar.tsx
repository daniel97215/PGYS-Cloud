import { Badge, Logo } from "@pgys/ui";
import type { PortalNavigationItem } from "@/lib/mock";
import { PortalNavigation } from "./portal-navigation";

type SidebarProps = {
  navigation: readonly PortalNavigationItem[];
};

export function Sidebar({ navigation }: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen border-r border-border bg-surface lg:flex lg:flex-col">
      <div className="flex min-h-20 items-center border-b border-border px-6">
        <Logo href="/" homeLabel="PGYS, tableau de bord" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.16em] text-content-muted">
          Mon espace
        </p>
        <PortalNavigation
          items={navigation}
          label="Navigation du portail"
        />
      </div>
      <div className="border-t border-border p-5">
        <div className="rounded-pgys-lg bg-surface-muted p-4">
          <Badge variant="success">Services opérationnels</Badge>
          <p className="mt-3 text-xs leading-5 text-content-muted">
            Interface de démonstration, sans données réelles.
          </p>
        </div>
      </div>
    </aside>
  );
}
