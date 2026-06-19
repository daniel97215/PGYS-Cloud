import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils/cx";

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  size?: "md" | "lg" | "xl";
};

const sizeClasses = {
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

export function Container({
  children,
  className,
  size = "xl",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cx(
        "mx-auto w-full px-5 sm:px-8 lg:px-12",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
