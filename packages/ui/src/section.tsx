import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils/cx";

export type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  spacing?: "sm" | "md" | "lg";
  tone?: "default" | "muted" | "dark" | "brand";
};

const spacingClasses = {
  sm: "py-12 sm:py-16",
  md: "py-16 sm:py-20",
  lg: "py-20 sm:py-28",
};

const toneClasses = {
  default: "bg-background text-content",
  muted: "bg-surface-muted text-content",
  dark: "bg-slate-950 text-white",
  brand: "bg-brand text-white",
};

export function Section({
  children,
  className,
  spacing = "lg",
  tone = "default",
  ...props
}: SectionProps) {
  return (
    <section
      className={cx(spacingClasses[spacing], toneClasses[tone], className)}
      {...props}
    >
      {children}
    </section>
  );
}
