"use client";

import { Icon } from "@pgys/ui";
import { usePathname } from "next/navigation";
import type { AdminNavigationItem } from "@/lib/admin";

type PortalNavigationProps = {
  items: readonly AdminNavigationItem[];
  label: string;
};

export function PortalNavigation({ items, label }: PortalNavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className="grid gap-1.5">
        {items.map((item) => {
          const baseHref = item.href.split("#")[0];
          const isCurrent =
            baseHref === "/" ? pathname === "/" : pathname.startsWith(baseHref);

          return (
            <li key={`${item.label}-${item.href}`}>
              <a
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={
                  isCurrent
                    ? "flex min-h-11 items-center gap-3 rounded-pgys-md bg-brand-soft px-3 py-2.5 text-sm font-bold text-brand-dark focus-visible:outline-2 focus-visible:outline-brand"
                    : "flex min-h-11 items-center gap-3 rounded-pgys-md px-3 py-2.5 text-sm font-semibold text-content-muted transition-colors hover:bg-surface-muted hover:text-content focus-visible:outline-2 focus-visible:outline-brand"
                }
              >
                <Icon name={item.icon} className="shrink-0" />
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
