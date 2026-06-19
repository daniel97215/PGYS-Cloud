import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils/cx";
import { Icon } from "./icon";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  title?: string;
  variant?: AlertVariant;
};

const variantClasses: Record<AlertVariant, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
  warning:
    "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
  danger: "border-red-200 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
};

const variantIcons = {
  info: "info",
  success: "checkCircle",
  warning: "warning",
  danger: "error",
} as const;

export function Alert({
  children,
  title,
  variant = "info",
  className,
  role,
  ...props
}: AlertProps) {
  return (
    <div
      role={role ?? (variant === "danger" ? "alert" : "status")}
      className={cx(
        "flex gap-3 rounded-pgys-lg border p-4 text-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <Icon name={variantIcons[variant]} className="mt-0.5 size-5 shrink-0" />
      <div>
        {title ? <p className="font-bold">{title}</p> : null}
        <div className={cx(title && "mt-1")}>{children}</div>
      </div>
    </div>
  );
}
