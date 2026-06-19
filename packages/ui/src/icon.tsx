import type { SVGAttributes } from "react";
import { cx } from "./utils/cx";

export type IconName =
  | "apps"
  | "arrowRight"
  | "backup"
  | "check"
  | "checkCircle"
  | "chevronDown"
  | "cloud"
  | "error"
  | "hosting"
  | "info"
  | "menu"
  | "warning";

export type IconProps = SVGAttributes<SVGSVGElement> & {
  label?: string;
  name: IconName;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

function IconPaths({ name }: { name: IconName }) {
  switch (name) {
    case "apps":
      return (
        <>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <path d="M17 14v6m-3-3h6" />
        </>
      );
    case "arrowRight":
      return <path d="M5 12h14m-5-5 5 5-5 5" />;
    case "backup":
      return (
        <>
          <path d="M20 11a8 8 0 1 0-2.34 5.66" />
          <path d="M20 5v6h-6" />
          <path d="M12 8v4l3 2" />
        </>
      );
    case "check":
      return <path d="m5 12 4 4L19 6" />;
    case "checkCircle":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </>
      );
    case "chevronDown":
      return <path d="m7 10 5 5 5-5" />;
    case "cloud":
      return (
        <>
          <path d="M7 18a4 4 0 0 1-.4-7.98A6 6 0 0 1 18 8a5 5 0 0 1 0 10H7Z" />
          <path d="M12 12v7m0-7-2.5 2.5M12 12l2.5 2.5" />
        </>
      );
    case "error":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m9 9 6 6m0-6-6 6" />
        </>
      );
    case "hosting":
      return (
        <>
          <rect x="4" y="5" width="16" height="6" rx="2" />
          <rect x="4" y="13" width="16" height="6" rx="2" />
          <path d="M8 8h.01M8 16h.01M12 8h5M12 16h5" />
        </>
      );
    case "info":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5m0-8h.01" />
        </>
      );
    case "menu":
      return <path d="M4 7h16M4 12h16M4 17h16" />;
    case "warning":
      return (
        <>
          <path d="M10.3 4.1 3.2 17a2 2 0 0 0 1.8 3h14a2 2 0 0 0 1.8-3L13.7 4.1a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4m0 3h.01" />
        </>
      );
  }
}

export function Icon({
  className,
  label,
  name,
  size = "md",
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx(sizeClasses[size], className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      <IconPaths name={name} />
    </svg>
  );
}
