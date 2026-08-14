import { Avatar, Icon } from "@pgys/ui";
import type { AdminNavigationItem } from "@/lib/admin";
import { PortalNavigation } from "./portal-navigation";

type TopbarProps = {
  customer: {
    firstName: string;
    initials: string;
    organization: string;
  };
  navigation: readonly AdminNavigationItem[];
};

export function Topbar({ customer, navigation }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-border bg-surface/90 px-5 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <details className="group relative">
          <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-pgys-md border border-border text-content marker:content-none hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-brand">
            <Icon name="menu" label="Ouvrir la navigation" />
          </summary>
          <div className="fixed left-4 right-4 top-[4.5rem] z-50 max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-pgys-xl border border-border bg-white p-4 shadow-pgys-elevated sm:absolute sm:left-0 sm:right-auto sm:top-14 sm:w-76">
            <p className="mb-5 px-2 text-lg font-black tracking-tight text-brand">
              PROGYS <span className="text-[#ff7900]">Admin</span>
            </p>
            <PortalNavigation
              items={navigation}
              label="Navigation mobile du portail"
            />
          </div>
        </details>
        <span className="text-sm font-black tracking-tight text-content sm:hidden">
          PROGYS
        </span>
      </div>

      <div className="hidden lg:block">
        <p className="text-sm font-semibold text-content">Portail opérateur</p>
        <p className="mt-0.5 text-xs text-content-muted">
          {customer.organization}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold text-content">{customer.firstName}</p>
          <p className="text-xs text-content-muted">Accès interne PGYS</p>
        </div>
        <Avatar alt="Compte administrateur PROGYS" initials={customer.initials} />
      </div>
    </header>
  );
}
