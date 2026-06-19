import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils/cx";

export type HeadingProps = Omit<HTMLAttributes<HTMLHeadingElement>, "title"> & {
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  description?: ReactNode;
  eyebrow?: ReactNode;
  inverse?: boolean;
  title: ReactNode;
};

export function Heading({
  align = "left",
  as: Title = "h2",
  className,
  description,
  eyebrow,
  inverse = false,
  title,
  ...props
}: HeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cx(
        "flex max-w-3xl flex-col",
        centered ? "mx-auto items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cx(
            "mb-4 text-sm font-bold uppercase tracking-[0.18em]",
            inverse ? "text-blue-200" : "text-brand",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <Title
        className={cx(
          "text-balance text-3xl font-bold tracking-[-0.035em] sm:text-4xl lg:text-5xl",
          inverse ? "text-white" : "text-content",
        )}
        {...props}
      >
        {title}
      </Title>
      {description ? (
        <div
          className={cx(
            "mt-5 max-w-2xl text-lg leading-8",
            inverse ? "text-blue-100" : "text-content-muted",
          )}
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}
