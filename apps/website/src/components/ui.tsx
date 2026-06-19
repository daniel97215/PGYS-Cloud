import type { AnchorHTMLAttributes, ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "secondary" | "light";
};

export function ButtonLink({
  className = "",
  variant = "primary",
  children,
  ...props
}: ButtonLinkProps) {
  const variants = {
    primary:
      "bg-pgys-blue text-white shadow-[0_12px_32px_rgba(37,99,235,0.22)] hover:bg-pgys-navy focus-visible:outline-pgys-blue",
    secondary:
      "border border-slate-300 bg-white text-pgys-ink hover:border-pgys-blue hover:text-pgys-blue focus-visible:outline-pgys-blue",
    light:
      "bg-white text-pgys-navy shadow-[0_12px_32px_rgba(15,23,42,0.16)] hover:bg-blue-50 focus-visible:outline-white",
  };

  return (
    <a
      className={`inline-flex min-h-12 items-center justify-center rounded-xl px-5 py-3 text-center text-sm font-bold transition-colors focus-visible:outline-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  titleId: string;
  inverse?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  titleId,
  inverse = false,
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto items-center text-center" : "items-start";
  const titleColor = inverse ? "text-white" : "text-pgys-ink";
  const descriptionColor = inverse ? "text-blue-100" : "text-pgys-slate";

  return (
    <div className={`flex max-w-3xl flex-col ${alignment}`}>
      <p className={`mb-4 text-sm font-bold uppercase tracking-[0.18em] ${inverse ? "text-blue-200" : "text-pgys-blue"}`}>
        {eyebrow}
      </p>
      <h2
        id={titleId}
        className={`text-balance text-3xl font-bold tracking-[-0.035em] sm:text-4xl lg:text-5xl ${titleColor}`}
      >
        {title}
      </h2>
      <p className={`mt-5 max-w-2xl text-lg leading-8 ${descriptionColor}`}>{description}</p>
    </div>
  );
}
