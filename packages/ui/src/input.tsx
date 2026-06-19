import type { InputHTMLAttributes } from "react";
import { cx } from "./utils/cx";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  helperText?: string;
  error?: string;
};

export function Input({
  id,
  label,
  helperText,
  error,
  className,
  required,
  ...props
}: InputProps) {
  const descriptionId = error
    ? `${id}-error`
    : helperText
      ? `${id}-description`
      : undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-content">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionId}
        className={cx(
          "min-h-11 w-full rounded-pgys-md border bg-surface px-3 py-2 text-sm text-content",
          "placeholder:text-content-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
          "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70",
          error ? "border-danger" : "border-border",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-description`} className="text-sm text-content-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
