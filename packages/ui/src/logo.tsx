import { cx } from "./utils/cx";

export type LogoProps = {
  className?: string;
  href?: string;
  homeLabel?: string;
  inverse?: boolean;
  label?: string;
  mark?: string;
};

export function Logo({
  className,
  homeLabel = "PGYS, retour à l’accueil",
  href,
  inverse = false,
  label = "PGYS",
  mark = "P",
}: LogoProps) {
  const content = (
    <>
      <span
        className={cx(
          "grid size-9 place-items-center rounded-pgys-md text-sm font-black",
          inverse ? "bg-white text-brand-dark" : "bg-brand text-white",
        )}
        aria-hidden="true"
      >
        {mark}
      </span>
      <span
        className={cx(
          "text-xl font-black tracking-[-0.04em]",
          inverse ? "text-white" : "text-content",
        )}
      >
        {label}
      </span>
    </>
  );
  const classes = cx(
    "inline-flex items-center gap-3 rounded-pgys-sm focus-visible:outline-2 focus-visible:outline-brand",
    className,
  );

  return href ? (
    <a href={href} aria-label={homeLabel} className={classes}>
      {content}
    </a>
  ) : (
    <span className={classes}>{content}</span>
  );
}
