export const colors = {
  brand: "#2563EB",
  brandDark: "#1E3A8A",
  ink: "#0F172A",
  slate: "#475569",
  mist: "#F8FAFC",
  white: "#FFFFFF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
} as const;

export const typography = {
  fontFamily: "var(--font-geist), Arial, Helvetica, sans-serif",
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    heading: "2.25rem",
    display: "3.5rem",
  },
} as const;

export const spacing = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  6: "1.5rem",
  8: "2rem",
  12: "3rem",
  16: "4rem",
  24: "6rem",
} as const;

export const radii = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px rgb(15 23 42 / 0.05)",
  card: "0 18px 50px rgb(15 23 42 / 0.08)",
  elevated: "0 24px 70px rgb(15 23 42 / 0.14)",
  brand: "0 12px 32px rgb(37 99 235 / 0.22)",
} as const;
