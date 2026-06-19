import type { HTMLAttributes } from "react";
import { cx } from "./utils/cx";
import { Button } from "./button";
import { Container } from "./container";
import { Icon } from "./icon";
import { Logo } from "./logo";

export type NavigationLink = {
  href: string;
  label: string;
};

export type NavbarProps = HTMLAttributes<HTMLElement> & {
  action?: NavigationLink;
  brandLabel?: string;
  homeHref?: string;
  homeLabel?: string;
  links: NavigationLink[];
  menuLabel?: string;
  navigationLabel?: string;
  sticky?: boolean;
};

export function Navbar({
  action,
  brandLabel = "PGYS",
  className,
  homeHref = "/",
  homeLabel,
  links,
  menuLabel = "Ouvrir le menu",
  navigationLabel = "Navigation principale",
  sticky = true,
  ...props
}: NavbarProps) {
  return (
    <header
      className={cx(
        "z-40 border-b border-border/80 bg-surface/90 backdrop-blur-xl",
        sticky && "sticky top-0",
        className,
      )}
      {...props}
    >
      <Container className="flex min-h-18 items-center justify-between gap-6">
        <Logo
          href={homeHref}
          label={brandLabel}
          homeLabel={homeLabel}
        />
        <nav
          aria-label={navigationLabel}
          className="hidden items-center gap-7 lg:flex"
        >
          {links.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="rounded-pgys-sm text-sm font-semibold text-content-muted transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
            >
              {link.label}
            </a>
          ))}
          {action ? (
            <Button href={action.href} size="lg">
              {action.label}
            </Button>
          ) : null}
        </nav>
        <details className="group relative lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-pgys-md border border-border px-3 text-sm font-bold text-content marker:content-none focus-visible:outline-2 focus-visible:outline-brand">
            <span>{menuLabel}</span>
            <Icon
              name="chevronDown"
              size="sm"
              className="transition group-open:rotate-180"
            />
          </summary>
          <nav
            aria-label={navigationLabel}
            className="absolute right-0 top-14 flex w-72 flex-col gap-1 rounded-pgys-xl border border-border bg-surface p-3 shadow-pgys-elevated"
          >
            {links.map((link) => (
              <a
                key={`${link.href}-${link.label}-mobile`}
                href={link.href}
                className="rounded-pgys-md px-4 py-3 text-sm font-semibold text-content-muted hover:bg-surface-muted hover:text-brand"
              >
                {link.label}
              </a>
            ))}
            {action ? (
              <Button href={action.href} className="mt-2">
                {action.label}
              </Button>
            ) : null}
          </nav>
        </details>
      </Container>
    </header>
  );
}
