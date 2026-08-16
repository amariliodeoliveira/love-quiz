import type { ReactNode } from "react";

/** Accessible wrapper for native form controls registered by React Hook Form. */
export default function FormField({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="login-hint">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="form-error" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="form-hint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
