"use client";

import { useState } from "react";
import { LEVEL_META, type Level } from "@/data/cards";
import type { DbCard } from "@/lib/db";
import Modal from "@/app/_components/Modal";
import Select from "@/app/_components/Select";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setSaving(true);
    await onSubmit(level, question.trim());
    setSaving(false);
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
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Saving..." : card ? "Save changes" : "Add card"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
