import type { HTMLAttributes } from "react";
import { cx } from "./utils/cx";
import { Container } from "./container";
import { Logo } from "./logo";
import type { NavigationLink } from "./navbar";

export type FooterColumn = {
  links: NavigationLink[];
  title: string;
};

export type FooterContact = {
  email: string;
  location?: string;
  title: string;
};

export type FooterProps = HTMLAttributes<HTMLElement> & {
  brandLabel?: string;
  columns: FooterColumn[];
  contact?: FooterContact;
  copyright: string;
  description: string;
  homeHref?: string;
  legalNote?: string;
  navigationLabel?: string;
};

export function Footer({
  brandLabel = "PGYS",
  className,
  columns,
  contact,
  copyright,
  description,
  homeHref = "/",
  legalNote,
  navigationLabel = "Navigation du pied de page",
  ...props
}: FooterProps) {
  return (
    <footer
      className={cx("bg-slate-950 text-slate-300", className)}
      {...props}
    >
      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo href={homeHref} label={brandLabel} inverse />
            <p className="mt-5 leading-7 text-slate-400">{description}</p>
          </div>
          <nav aria-label={navigationLabel} className="contents">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="font-bold text-white">{column.title}</p>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      <a
                        href={link.href}
                        className="rounded-pgys-sm text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          {contact ? (
            <div>
              <p className="font-bold text-white">{contact.title}</p>
              <a
                href={`mailto:${contact.email}`}
                className="mt-5 block rounded-pgys-sm text-sm text-slate-400 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
              >
                {contact.email}
              </a>
              {contact.location ? (
                <p className="mt-3 text-sm text-slate-400">
                  {contact.location}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{copyright}</p>
          {legalNote ? <p>{legalNote}</p> : null}
        </div>
      </Container>
    </footer>
  );
}
