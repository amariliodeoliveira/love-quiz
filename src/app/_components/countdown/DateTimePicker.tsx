"use client";

import { useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { useClickOutside } from "@/lib/useClickOutside";
import Select from "./Select";
import type { WallClockParts } from "@/lib/countdown";

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1).map((h) => ({
  value: String(h),
  label: String(h),
}));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => i).map((m) => ({
  value: String(m).padStart(2, "0"),
  label: String(m).padStart(2, "0"),
}));

function to12Hour(hour24: number): { hour12: number; period: "AM" | "PM" } {
  const period = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, period };
}

function to24Hour(hour12: number, period: "AM" | "PM"): number {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

/**
 * Custom date + time picker (calendar via react-day-picker, 12-hour time controls).
 * Native `<input type="datetime-local">` can't be restyled — its popup calendar is
 * rendered entirely by the OS/browser, same reason this app already has a custom
 * `Select` instead of a native `<select>`. Always works in 12-hour format regardless
 * of the browser's locale.
 */
export default function DateTimePicker({
  id,
  value,
  onChange,
  describedBy,
}: {
  id: string;
  value: WallClockParts | null;
  onChange: (parts: WallClockParts) => void;
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useClickOutside(rootRef, open, () => setOpen(false));

  function toggleOpen() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopoverPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((o) => !o);
  }

  const selectedDate = value ? new Date(value.year, value.month - 1, value.day) : undefined;
  const { hour12, period } = value ? to12Hour(value.hour) : { hour12: 12, period: "PM" as const };
  const minute = value?.minute ?? 0;

  function commit(next: Partial<WallClockParts & { period: "AM" | "PM"; hour12: number }>) {
    const base = value ?? {
      year: selectedDate?.getFullYear() ?? new Date().getFullYear(),
      month: (selectedDate?.getMonth() ?? new Date().getMonth()) + 1,
      day: selectedDate?.getDate() ?? new Date().getDate(),
      hour: to24Hour(hour12, period),
      minute,
    };
    const nextHour12 = next.hour12 ?? hour12;
    const nextPeriod = next.period ?? period;
    onChange({
      year: next.year ?? base.year,
      month: next.month ?? base.month,
      day: next.day ?? base.day,
      hour: next.hour ?? to24Hour(nextHour12, nextPeriod),
      minute: next.minute ?? base.minute,
    });
  }

  const displayText = value
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(value.year, value.month - 1, value.day, value.hour, value.minute),
      )
    : "Pick a date and time";

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="input text-left"
        onClick={toggleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={describedBy}
      >
        {displayText}
      </button>

      {open && popoverPos && (
        <div
          className="select-menu w-max max-h-none p-3"
          style={{ position: "fixed", top: popoverPos.top, left: popoverPos.left, zIndex: 70 }}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return;
              commit({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
            }}
          />
          <div className="mt-2 flex items-center justify-center gap-2">
            <Select
              value={String(hour12)}
              onChange={(v) => commit({ hour12: Number(v) })}
              options={HOUR_OPTIONS}
            />
            <span className="text-text">:</span>
            <Select
              value={String(minute).padStart(2, "0")}
              onChange={(v) => commit({ minute: Number(v) })}
              options={MINUTE_OPTIONS}
            />
            <div className="flex gap-1">
              {(["AM", "PM"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`tab ${p === period ? "border-purple bg-purple-dim text-purple" : ""}`}
                  onClick={() => commit({ period: p })}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
