"use client";

import { useId, useRef, useState } from "react";

import { useClickOutside } from "@/lib/useClickOutside";

export default function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Required because this custom listbox does not have a native <select> label. */
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useClickOutside(rootRef, open, () => setOpen(false));

  const selected = options.find((o) => o.value === value);

  return (
    <div className="select" ref={rootRef}>
      <button
        type="button"
        className="select-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-controls={menuId}
        aria-expanded={open}
        aria-label={label}
      >
        <span>{selected?.label ?? ""}</span>
        <span className="select-arrow" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <ul id={menuId} className="select-menu" aria-label={label}>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={`select-option ${option.value === value ? "selected" : ""}`}
                aria-pressed={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
