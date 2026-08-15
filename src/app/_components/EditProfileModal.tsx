"use client";

import { useState } from "react";

import Modal from "@/app/_components/Modal";
import { patchJson } from "@/lib/http";

/** Editing scope is deliberately narrow: display name only. Username stays fixed here
 * on purpose — it's the login credential (typed to sign in, unique, baked into the
 * signed session cookie at login time), so changing it needs its own re-login/
 * uniqueness handling this modal doesn't attempt yet. */
export default function EditProfileModal({
  initialDisplayName,
  onClose,
  onSaved,
}: {
  initialDisplayName: string;
  onClose: () => void;
  onSaved: (displayName: string) => void;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) return;

    setSaving(true);
    setError(null);
    const { ok } = await patchJson("/api/profile/me", {
      displayName: trimmed,
    });
    setSaving(false);
    if (ok) {
      onSaved(trimmed);
    } else {
      setError(
        "Couldn't save your name — check your connection and try again.",
      );
    }
  }

  return (
    <Modal open onClose={onClose} title="Edit profile">
      <form onSubmit={handleSubmit} className="modal-form">
        <label htmlFor="display-name" className="login-hint">
          Display name
        </label>
        <input
          id="display-name"
          type="text"
          className="input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={40}
          autoFocus
        />
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
