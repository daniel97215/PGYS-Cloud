import Image from "next/image";
import Link from "next/link";
import { Badge } from "@pgys/ui";
import type { PortalNavigationItem } from "@/lib/mock";
import { PortalNavigation } from "./portal-navigation";

type SidebarProps = {
  navigation: readonly PortalNavigationItem[];
};

function BrandLogo() {
  return (
    <Link href="/" aria-label="PROGYS, administration" className="block w-40">
      <span className="block h-12 overflow-hidden">
        <Image
          src="/brand/progys-logo.png"
          alt="PROGYS"
          width={1694}
          height={953}
          className="h-auto w-full -translate-y-[28%]"
          priority
        />
      </span>
    </Link>
  );
}

export function Sidebar({ navigation }: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen border-r border-border bg-surface lg:flex lg:flex-col">
      <div className="flex min-h-20 items-center border-b border-border px-6">
        <BrandLogo />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.16em] text-content-muted">
          Administration
        </p>
        <PortalNavigation items={navigation} label="Navigation du portail" />
      </div>
      <div className="border-t border-border p-5">
        <div className="rounded-pgys-lg bg-surface-muted p-4">
          <Badge variant="success">Portail disponible</Badge>
          <p className="mt-3 text-xs leading-5 text-content-muted">
            Les accès sont regroupés ici pendant la construction des fonctions
            d’administration.
          </p>
        </div>
      </div>
    </aside>
  );
}
