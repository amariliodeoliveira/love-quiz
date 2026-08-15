"use client";

import { useId, useRef, useState } from "react";

import type { GeocodeResult } from "@/app/api/geocode/route";
import {
  utcToZonedParts,
  type WallClockParts,
  zonedTimeToUtc,
} from "@/lib/countdown";
import { getJson, patchJson } from "@/lib/http";

import DateTimePicker from "./DateTimePicker";

export const DEFAULT_COUNTDOWN_LABEL = "Together again in";

export interface CountdownFormInitial {
  label: string;
  location: string | null;
  timeZone: string;
  targetAtIso: string;
}

export interface CountdownFormResult {
  label: string;
  location: string | null;
  timeZone: string;
  targetAtIso: string;
}

export default function CountdownForm({
  initial,
  onSaved,
  onCancel,
}: {
  /** Existing countdown to edit, or null when setting one for the first time. */
  initial: CountdownFormInitial | null;
  onSaved: (result: CountdownFormResult) => void;
  onCancel: () => void;
}) {
  const labelId = useId();
  const cityId = useId();
  const cityListId = useId();
  const timeZoneHintId = useId();
  const dateId = useId();
  const errorId = useId();

  const [label, setLabel] = useState(initial?.label ?? "");
  const [locationQuery, setLocationQuery] = useState(initial?.location ?? "");
  const [timeZone, setTimeZone] = useState<string | null>(
    initial?.timeZone ?? null,
  );
  const [dateParts, setDateParts] = useState<WallClockParts | null>(
    initial
      ? utcToZonedParts(new Date(initial.targetAtIso), initial.timeZone)
      : null,
  );
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  let submitLabel = initial ? "Save changes" : "Create countdown";
  if (saving) submitLabel = "Saving...";

  function handleLocationInput(query: string) {
    setLocationQuery(query);
    setTimeZone(null); // a fresh pick is required before this can be saved again
    setError(null);

    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      const { ok, data } = await getJson<{ results: GeocodeResult[] }>(
        `/api/geocode?q=${encodeURIComponent(query.trim())}`,
      );
      setSearching(false);
      setSuggestions(ok && data ? data.results : []);
    }, 300);
  }

  function handlePickSuggestion(result: GeocodeResult) {
    setLocationQuery(result.label);
    setTimeZone(result.timeZone);
    setSuggestions([]);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!dateParts) {
      setError("Choose a date and time.");
      return;
    }
    if (!timeZone) {
      setError(
        "Pick a city from the suggestions below, so the time zone is known.",
      );
      return;
    }
    setError(null);

    setSaving(true);
    const { ok, data } = await patchJson<{ error?: string }>("/api/countdown", {
      ...dateParts,
      timeZone,
      location: locationQuery.trim() || null,
      label: label.trim() || DEFAULT_COUNTDOWN_LABEL,
    });
    setSaving(false);

    if (!ok) {
      setError(
        data?.error ??
          "Couldn't save the countdown — check your connection and try again.",
      );
      return;
    }

    const targetAt = zonedTimeToUtc(dateParts, timeZone);
    onSaved({
      label: label.trim() || DEFAULT_COUNTDOWN_LABEL,
      location: locationQuery.trim() || null,
      timeZone,
      targetAtIso: targetAt.toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="modal-form" noValidate>
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="sr-only">Countdown details</legend>

        <div className="flex flex-col gap-1">
          <label htmlFor={labelId} className="login-hint">
            Label
          </label>
          <input
            id={labelId}
            type="text"
            className="input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={DEFAULT_COUNTDOWN_LABEL}
            maxLength={60}
          />
        </div>

        <div className="relative flex flex-col gap-1">
          <label htmlFor={cityId} className="login-hint">
            City
          </label>
          <input
            id={cityId}
            type="text"
            className="input"
            value={locationQuery}
            onChange={(e) => handleLocationInput(e.target.value)}
            placeholder="e.g. Fortaleza"
            autoComplete="off"
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-controls={cityListId}
            aria-describedby={timeZone ? timeZoneHintId : undefined}
          />
          {searching && <p className="login-hint">Searching...</p>}
          {!searching && suggestions.length > 0 && (
            <ul id={cityListId} className="select-menu" role="listbox">
              {suggestions.map((s) => (
                <li
                  key={`${s.label}-${s.timeZone}`}
                  role="option"
                  aria-selected={false}
                >
                  <button
                    type="button"
                    className="select-option"
                    onClick={() => handlePickSuggestion(s)}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {timeZone && (
            <p id={timeZoneHintId} className="login-hint">
              Time zone: {timeZone}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={dateId} className="login-hint">
            Date and time (local to the city above)
          </label>
          <DateTimePicker
            id={dateId}
            value={dateParts}
            onChange={setDateParts}
            describedBy={error ? errorId : undefined}
          />
        </div>

        {error && (
          <p id={errorId} className="form-error" role="alert">
            {error}
          </p>
        )}
      </fieldset>

      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={saving}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
