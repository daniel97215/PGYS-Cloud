import type { SVGAttributes } from "react";
import { cx } from "./utils/cx";

export type IconName =
  | "apps"
  | "arrowRight"
  | "backup"
  | "bell"
  | "check"
  | "checkCircle"
  | "chevronDown"
  | "cloud"
  | "error"
  | "hosting"
  | "home"
  | "info"
  | "menu"
  | "settings"
  | "ticket"
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
    case "bell":
      return (
        <>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
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
    case "home":
      return (
        <>
          <path d="m3 11 9-8 9 8" />
          <path d="M5 10v10h14V10M9 20v-6h6v6" />
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
    case "settings":
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.09 14H3v-4h.09A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63h.01A1.7 1.7 0 0 0 10 3.09V3h4v.09A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9v.01A1.7 1.7 0 0 0 20.91 10H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
        </>
      );
    case "ticket":
      return (
        <>
          <path d="M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3Z" />
          <path d="M13 9v.01M13 12v.01M13 15v.01" />
        </>
      );
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
