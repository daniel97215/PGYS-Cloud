import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils/cx";

export type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "div" | "section";
  children: ReactNode;
  variant?: "default" | "muted" | "outlined";
};

const variantClasses = {
  default: "border-border bg-surface shadow-pgys-card",
  muted: "border-transparent bg-surface-muted",
  outlined: "border-border bg-transparent",
};

export function Card({
  as: Component = "div",
  children,
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <Component
      className={cx(
        "rounded-pgys-xl border text-content",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
