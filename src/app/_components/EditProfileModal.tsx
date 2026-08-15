"use client";

import { useState } from "react";

import Modal from "@/app/_components/Modal";
import { AVATAR_COLORS } from "@/lib/avatar";
import { patchJson } from "@/lib/http";

/** Editing scope is deliberately narrow: display name and avatar color — the two
 * "how you appear to your partner" settings. Username stays fixed here on purpose —
 * it's the login credential (typed to sign in, unique, baked into the signed session
 * cookie at login time), so changing it needs its own re-login/uniqueness handling
 * this modal doesn't attempt yet. */
export default function EditProfileModal({
  initialDisplayName,
  initialAvatarColor,
  onClose,
  onSaved,
}: {
  initialDisplayName: string;
  initialAvatarColor: string;
  onClose: () => void;
  onSaved: (result: { displayName: string; avatarColor: string }) => void;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarColor, setAvatarColor] = useState(initialAvatarColor);
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
      avatarColor,
    });
    setSaving(false);
    if (ok) {
      onSaved({ displayName: trimmed, avatarColor });
    } else {
      setError(
        "Couldn't save your profile — check your connection and try again.",
      );
    }
  }

  return (
    <Modal open onClose={onClose} title="Edit profile">
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="flex flex-col gap-1">
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
        </div>

        <div className="flex flex-col gap-2">
          <p className="login-hint">Avatar color</p>
          <div className="avatar-swatches mb-0">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                className={`avatar-swatch ${c.name === avatarColor ? "selected" : ""}`}
                style={{ backgroundColor: c.hex }}
                aria-label={`Use ${c.name} avatar color`}
                onClick={() => setAvatarColor(c.name)}
              />
            ))}
          </div>
        </div>

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
