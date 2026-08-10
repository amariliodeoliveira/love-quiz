"use client";

import { useState } from "react";
import { LEVEL_META, type Level } from "@/data/cards";
import Modal from "@/app/_components/Modal";
import Select from "@/app/_components/Select";

const LEVEL_OPTIONS = Object.entries(LEVEL_META).map(([value, meta]) => ({
  value,
  label: `${meta.emoji} ${meta.label}`,
}));

export default function AIGenerateModal({
  onClose,
  onGenerate,
}: {
  onClose: () => void;
  onGenerate: (level: Level) => Promise<boolean>;
}) {
  const [level, setLevel] = useState<Level>("1");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const ok = await onGenerate(level);
    setGenerating(false);
    if (ok) {
      onClose();
    } else {
      setError("Couldn't generate a question — check your connection and try again.");
    }
  }

  return (
    <Modal open onClose={onClose} title="Generate with AI">
      <div className="modal-form">
        <Select value={level} onChange={(v) => setLevel(v as Level)} options={LEVEL_OPTIONS} />
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn" onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
