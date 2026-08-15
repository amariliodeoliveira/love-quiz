"use client";

import { useState } from "react";

import Modal from "@/app/_components/Modal";
import Select from "@/app/_components/Select";
import { type Level, LEVEL_META } from "@/data/cards";
import type { DbCard } from "@/lib/db";
import { postJson } from "@/lib/http";

const LEVEL_OPTIONS = Object.entries(LEVEL_META).map(([value, meta]) => ({
  value,
  label: `${meta.emoji} ${meta.label}`,
}));

export default function CardFormModal({
  card,
  onClose,
  onSubmit,
}: {
  /** Card being edited, or undefined when adding a new one. */
  card?: DbCard;
  onClose: () => void;
  onSubmit: (level: Level, question: string) => Promise<void>;
}) {
  const [level, setLevel] = useState<Level>(card?.level ?? "1");
  const [question, setQuestion] = useState(card?.question ?? "");
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  let submitLabel = card ? "Save changes" : "Add card";
  if (saving) submitLabel = "Saving...";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setSaving(true);
    await onSubmit(level, question.trim());
    setSaving(false);
  }

  async function handleDraftWithAi() {
    // Disabling the button for the duration of the request (via `drafting`) is the
    // real guard against someone mashing the click — the request itself is also
    // rate-limited server-side (see /api/ai-cards/draft) as a backstop against
    // multiple tabs/requests firing around the client-side disable.
    setDrafting(true);
    setDraftError(null);
    const { ok, data } = await postJson<{ level: Level; question: string }>(
      "/api/ai-cards/draft",
      { level },
    );
    setDrafting(false);
    if (ok && data) {
      setQuestion(data.question);
    } else {
      setDraftError(
        "Couldn't draft a question — check your connection and try again.",
      );
    }
  }

  return (
    <Modal open onClose={onClose} title={card ? "Edit card" : "Add card"}>
      <form onSubmit={handleSubmit} className="modal-form">
        <Select
          value={level}
          onChange={(v) => setLevel(v as Level)}
          options={LEVEL_OPTIONS}
        />
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question or dare..."
          className="input textarea"
          autoFocus
          rows={4}
        />
        {!card && (
          <button
            type="button"
            className="btn-ghost"
            onClick={handleDraftWithAi}
            disabled={drafting}
          >
            {drafting ? "Drafting..." : "🤖 Ask AI to draft one"}
          </button>
        )}
        {draftError && <p className="form-error">{draftError}</p>}
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={saving}>
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
