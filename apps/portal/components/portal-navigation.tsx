import { Icon } from "@pgys/ui";
import type { PortalNavigationItem } from "@/lib/mock";

type PortalNavigationProps = {
  items: readonly PortalNavigationItem[];
  label: string;
};

export function PortalNavigation({ items, label }: PortalNavigationProps) {
  return (
    <nav aria-label={label}>
      <ul className="grid gap-1.5">
        {items.map((item) => (
          <li key={`${item.label}-${item.href}`}>
            <a
              href={item.href}
              aria-current={item.isCurrent ? "page" : undefined}
              className={
                item.isCurrent
                  ? "flex min-h-11 items-center gap-3 rounded-pgys-md bg-brand-soft px-3 py-2.5 text-sm font-bold text-brand-dark focus-visible:outline-2 focus-visible:outline-brand"
                  : "flex min-h-11 items-center gap-3 rounded-pgys-md px-3 py-2.5 text-sm font-semibold text-content-muted transition-colors hover:bg-surface-muted hover:text-content focus-visible:outline-2 focus-visible:outline-brand"
              }
            >
              <Icon name={item.icon} className="shrink-0" />
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
