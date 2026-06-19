import { Avatar, Button, Icon, Logo } from "@pgys/ui";
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
            <Logo href="/" className="mb-5 px-2" />
            <PortalNavigation
              items={navigation}
              label="Navigation mobile du portail"
            />
          </div>
        </details>
        <span className="text-sm font-black tracking-tight text-content sm:hidden">
          PGYS
        </span>
      </div>

      <div className="hidden lg:block">
        <p className="text-sm font-semibold text-content">Espace client</p>
        <p className="mt-0.5 text-xs text-content-muted">
          {customer.organization}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <Button
          variant="subtle"
          size="sm"
          aria-label="Consulter les notifications"
          className="size-10 px-0"
        >
          <Icon name="bell" />
        </Button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold text-content">{customer.firstName}</p>
          <p className="text-xs text-content-muted">Compte de démonstration</p>
        </div>
        <Avatar
          alt={`Compte de ${customer.firstName}`}
          initials={customer.initials}
        />
      </div>
    </header>
  );
}
