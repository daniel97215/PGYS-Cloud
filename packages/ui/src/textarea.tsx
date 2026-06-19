import type { TextareaHTMLAttributes } from "react";
import { cx } from "./utils/cx";

export type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id"
> & {
  id: string;
  label: string;
  helperText?: string;
  error?: string;
};

export function Textarea({
  id,
  label,
  helperText,
  error,
  className,
  required,
  rows = 4,
  ...props
}: TextareaProps) {
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
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionId}
        className={cx(
          "w-full resize-y rounded-pgys-md border bg-surface px-3 py-2 text-sm text-content",
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
