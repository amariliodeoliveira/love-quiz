"use client";

import { useState } from "react";

import Modal from "@/app/_components/Modal";
import { AVATAR_COLORS, AVATAR_EMOJIS, isAvatarEmoji } from "@/lib/avatar";
import { patchJson } from "@/lib/http";

/** Editing scope is deliberately narrow: display name, avatar color, and avatar emoji —
 * the "how you appear to your partner" settings. Username stays fixed here on purpose —
 * it's the login credential (typed to sign in, unique, baked into the signed session
 * cookie at login time), so changing it needs its own re-login/uniqueness handling
 * this modal doesn't attempt yet. */
export default function EditProfileModal({
  initialDisplayName,
  initialAvatarColor,
  initialAvatarEmoji,
  initialAvatarEmojiOptions,
  onClose,
  onSaved,
}: {
  initialDisplayName: string;
  initialAvatarColor: string;
  initialAvatarEmoji: string | null;
  /** This user's own personalized emoji-grid ordering (each user builds up their own
   * as they pick custom emoji) — null means they haven't customized it yet, so fall
   * back to the shared curated default. */
  initialAvatarEmojiOptions: string[] | null;
  onClose: () => void;
  onSaved: (result: {
    displayName: string;
    avatarColor: string;
    avatarEmoji: string | null;
    avatarEmojiOptions: string[] | null;
  }) => void;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarColor, setAvatarColor] = useState(initialAvatarColor);
  const [avatarEmoji, setAvatarEmoji] = useState(initialAvatarEmoji);
  // A picked-via-"+" custom emoji is prepended and bumps the oldest option off the
  // end, so the grid's size never grows unbounded. Persisted per-user on save (see
  // handleSubmit) so it's this account's own list next time, not shared/reset.
  const [emojiOptions, setEmojiOptions] = useState<readonly string[]>(
    initialAvatarEmojiOptions ?? AVATAR_EMOJIS,
  );
  const [emojiOptionsChanged, setEmojiOptionsChanged] = useState(false);
  const [pickingCustomEmoji, setPickingCustomEmoji] = useState(false);
  const [customEmojiDraft, setCustomEmojiDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function commitCustomEmoji() {
    const trimmed = customEmojiDraft.trim();
    setPickingCustomEmoji(false);
    setCustomEmojiDraft("");
    if (!isAvatarEmoji(trimmed)) return;
    setAvatarEmoji(trimmed);
    setEmojiOptions((prev) => [trimmed, ...prev.slice(0, -1)]);
    setEmojiOptionsChanged(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) return;

    setSaving(true);
    setError(null);
    const avatarEmojiOptions = emojiOptionsChanged ? [...emojiOptions] : null;
    const { ok } = await patchJson("/api/profile/me", {
      displayName: trimmed,
      avatarColor,
      avatarEmoji,
      ...(emojiOptionsChanged && { avatarEmojiOptions }),
    });
    setSaving(false);
    if (ok) {
      onSaved({
        displayName: trimmed,
        avatarColor,
        avatarEmoji,
        avatarEmojiOptions: emojiOptionsChanged
          ? avatarEmojiOptions
          : initialAvatarEmojiOptions,
      });
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

        <div className="flex flex-col gap-2">
          <p className="login-hint">Avatar emoji</p>
          <div className="avatar-emoji-grid">
            {pickingCustomEmoji ? (
              <input
                type="text"
                className="avatar-emoji-option avatar-emoji-input"
                value={customEmojiDraft}
                onChange={(e) => setCustomEmojiDraft(e.target.value)}
                onBlur={commitCustomEmoji}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitCustomEmoji();
                  }
                  if (e.key === "Escape") {
                    setPickingCustomEmoji(false);
                    setCustomEmojiDraft("");
                  }
                }}
                placeholder="😊"
                aria-label="Type or paste any emoji"
                autoFocus
              />
            ) : (
              <button
                type="button"
                className="avatar-emoji-option"
                aria-label="Pick any emoji"
                onClick={() => setPickingCustomEmoji(true)}
              >
                +
              </button>
            )}
            {emojiOptions.map((e) => (
              <button
                key={e}
                type="button"
                className={`avatar-emoji-option ${e === avatarEmoji ? "selected" : ""}`}
                aria-label={`Use ${e} as the avatar emoji`}
                onClick={() => setAvatarEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
          {pickingCustomEmoji && (
            <p className="avatar-emoji-hint">
              Open your emoji keyboard (Windows: Win + . — Mac: Cmd + Ctrl +
              Space), then type or paste one here.
            </p>
          )}
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
