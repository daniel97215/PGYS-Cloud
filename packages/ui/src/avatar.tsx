import type { HTMLAttributes } from "react";
import { cx } from "./utils/cx";

export type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  alt: string;
  initials: string;
  size?: "sm" | "md" | "lg";
  src?: string;
};

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
};

export function Avatar({
  alt,
  initials,
  size = "md",
  src,
  className,
  ...props
}: AvatarProps) {
  return (
    <span
      className={cx(
        "inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-soft font-bold text-brand-dark",
        sizeClasses[size],
        className,
      )}
      title={alt}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <span aria-label={alt}>{initials}</span>
      )}
    </span>
  );
}
