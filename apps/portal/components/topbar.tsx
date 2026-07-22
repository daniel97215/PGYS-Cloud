import { Avatar, Button, Icon } from "@pgys/ui";
import type { PortalNavigationItem } from "@/lib/mock";
import { PortalNavigation } from "./portal-navigation";

type TopbarProps = {
  customer: {
    firstName: string;
    initials: string;
    organization: string;
  };
  navigation: readonly PortalNavigationItem[];
};

export function Topbar({ customer, navigation }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-border bg-surface/90 px-5 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <details className="group relative">
          <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-pgys-md border border-border text-content marker:content-none hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-brand">
            <Icon name="menu" label="Ouvrir la navigation" />
          </summary>
          <div className="absolute left-0 top-14 w-[min(19rem,calc(100vw-2.5rem))] rounded-pgys-xl border border-border bg-surface p-4 shadow-pgys-elevated">
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
        <p className="text-sm font-semibold text-content">Portail administrateur</p>
        <p className="mt-0.5 text-xs text-content-muted">
          {customer.organization}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <Button
          href="https://pgys.fr"
          target="_blank"
          rel="noreferrer"
          variant="subtle"
          size="sm"
          className="hidden sm:inline-flex"
        >
          Voir le site
          <Icon name="arrowRight" size="sm" />
        </Button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold text-content">{customer.firstName}</p>
          <p className="text-xs text-content-muted">Accès administrateur</p>
        </div>
        <Avatar alt="Compte administrateur PROGYS" initials={customer.initials} />
      </div>
    </header>
  );
}
