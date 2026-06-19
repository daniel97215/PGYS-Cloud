import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cx } from "./utils/cx";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "subtle"
  | "danger"
  | "light";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonAsButton = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonAsLink = ButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white shadow-pgys-brand hover:bg-brand-dark focus-visible:outline-brand",
  secondary:
    "border border-border bg-surface text-content hover:border-brand hover:text-brand focus-visible:outline-brand",
  subtle:
    "bg-surface-muted text-content hover:bg-brand-soft hover:text-brand-dark focus-visible:outline-brand",
  danger:
    "bg-danger text-white hover:bg-red-700 focus-visible:outline-danger",
  light:
    "bg-white text-brand-dark shadow-pgys-brand hover:bg-blue-50 focus-visible:outline-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-pgys-sm px-3 py-2 text-xs",
  md: "min-h-11 rounded-pgys-md px-4 py-2.5 text-sm",
  lg: "min-h-12 rounded-pgys-md px-5 py-3 text-sm",
};

function getButtonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return cx(
    "inline-flex items-center justify-center gap-2 text-center font-bold transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button(props: ButtonProps) {
  if ("href" in props) {
    const {
      variant = "primary",
      size = "md",
      className,
      children,
      ...linkProps
    } = props;

    return (
      <a
        className={getButtonClassName(variant, size, className)}
        {...linkProps}
      >
        {children}
      </a>
    );
  }

  const {
    variant = "primary",
    size = "md",
    className,
    children,
    type = "button",
    ...buttonProps
  } = props;

  return (
    <button
      type={type}
      className={getButtonClassName(variant, size, className)}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
