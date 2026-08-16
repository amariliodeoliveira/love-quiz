"use client";

import { type ComponentPropsWithoutRef, forwardRef, useState } from "react";

type TextFieldProps = ComponentPropsWithoutRef<"input">;

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="20"
    >
      {hidden ? (
        <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      ) : (
        <>
          <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      )}
    </svg>
  );
}

/**
 * Native text input with the app's shared visual and accessibility treatment.
 * Passwords deliberately retain native input semantics and add only a reveal control.
 */
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ className, type = "text", ...props }, ref) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && passwordVisible ? "text" : type;
    const inputClassName = ["input", className].filter(Boolean).join(" ");

    if (!isPassword) {
      return (
        <input
          {...props}
          ref={ref}
          type={inputType}
          className={inputClassName}
        />
      );
    }

    return (
      <div className="input-with-action">
        <input
          {...props}
          ref={ref}
          type={inputType}
          className={inputClassName}
        />
        <button
          type="button"
          className="input-action"
          aria-label={passwordVisible ? "Hide password" : "Show password"}
          aria-pressed={passwordVisible}
          onClick={() => setPasswordVisible((visible) => !visible)}
        >
          <EyeIcon hidden={passwordVisible} />
        </button>
      </div>
    );
  },
);

export default TextField;
