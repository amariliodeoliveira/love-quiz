"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import ConfirmationModal from "@/app/_components/ConfirmationModal";
import FormField from "@/app/_components/FormField";
import Modal from "@/app/_components/Modal";
import TextField from "@/app/_components/TextField";
import {
  AVATAR_COLORS,
  avatarColorHex,
  avatarInitial,
  isAvatarEmoji,
  mergeAvatarEmojiOptions,
  recordAvatarEmojiSelection,
} from "@/lib/avatar";
import { patchJson } from "@/lib/http";
import {
  displayNamePolicy,
  profileEditorSchema,
  type ProfileEditorValues,
} from "@/lib/profile";

import ChangePasswordForm from "./ChangePasswordForm";

function isIncompleteEmojiInput(value: string) {
  return /[\uD800-\uDBFF]$/.test(value);
}

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
  const {
    register,
    handleSubmit: handleProfileSubmit,
    setError: setProfileError,
    control,
    formState: {
      errors: profileErrors,
      isDirty: profileTextIsDirty,
      isSubmitting,
    },
  } = useForm<ProfileEditorValues>({
    resolver: zodResolver(profileEditorSchema),
    defaultValues: { displayName: initialDisplayName },
    mode: "onTouched",
  });
  const displayName = useWatch({ control, name: "displayName" });
  const [avatarColor, setAvatarColor] = useState(initialAvatarColor);
  const [avatarEmoji, setAvatarEmoji] = useState(initialAvatarEmoji);
  const [emojiOptions, setEmojiOptions] = useState<readonly string[]>(() =>
    mergeAvatarEmojiOptions(initialAvatarEmojiOptions),
  );
  const [emojiOptionsChanged, setEmojiOptionsChanged] = useState(false);
  const [pickingCustomEmoji, setPickingCustomEmoji] = useState(false);
  const [customEmojiDraft, setCustomEmojiDraft] = useState("");
  const customEmojiInputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<"profile" | "password">("profile");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordDirty, setPasswordDirty] = useState(false);
  const [discardTarget, setDiscardTarget] = useState<
    "close" | "profile" | null
  >(null);

  const profileDirty =
    profileTextIsDirty ||
    avatarColor !== initialAvatarColor ||
    avatarEmoji !== initialAvatarEmoji ||
    emojiOptionsChanged ||
    customEmojiDraft.length > 0;
  const activeViewIsDirty = view === "password" ? passwordDirty : profileDirty;

  function requestClose() {
    if (isSubmitting) return;
    if (activeViewIsDirty) {
      setDiscardTarget("close");
      return;
    }
    onClose();
  }

  function requestProfileView() {
    if (passwordDirty) {
      setDiscardTarget("profile");
      return;
    }
    setView("profile");
  }

  const handlePasswordDirtyChange = useCallback((isDirty: boolean) => {
    setPasswordDirty(isDirty);
  }, []);

  useEffect(() => {
    if (pickingCustomEmoji) customEmojiInputRef.current?.focus();
  }, [pickingCustomEmoji]);

  function addCustomEmoji(value: string) {
    const trimmed = value.trim();
    if (!isAvatarEmoji(trimmed)) return;
    selectAvatarEmoji(trimmed);
    setPickingCustomEmoji(false);
    setCustomEmojiDraft("");
  }

  function selectAvatarEmoji(emoji: string) {
    setAvatarEmoji(emoji);
    setEmojiOptions((previousOptions) =>
      recordAvatarEmojiSelection(previousOptions, emoji),
    );
    setEmojiOptionsChanged(true);
  }

  function cancelCustomEmoji() {
    setPickingCustomEmoji(false);
    setCustomEmojiDraft("");
  }

  async function submitProfile({ displayName }: ProfileEditorValues) {
    const avatarEmojiOptions = emojiOptionsChanged ? [...emojiOptions] : null;
    try {
      const { ok } = await patchJson("/api/profile/me", {
        displayName,
        avatarColor,
        avatarEmoji,
        ...(emojiOptionsChanged && { avatarEmojiOptions }),
      });
      if (ok) {
        onSaved({
          displayName,
          avatarColor,
          avatarEmoji,
          avatarEmojiOptions: emojiOptionsChanged
            ? avatarEmojiOptions
            : initialAvatarEmojiOptions,
        });
        return;
      }
    } catch {
      // The shared error below covers network and non-success responses alike.
    }
    setProfileError("root", {
      message:
        "Couldn't save your profile — check your connection and try again.",
    });
  }

  const profileSubmitLabel = isSubmitting ? "Saving..." : "Save changes";

  return (
    <Modal
      open
      onClose={requestClose}
      title={view === "profile" ? "Profile settings" : "Change password"}
    >
      {view === "password" ? (
        <ChangePasswordForm
          onBack={requestProfileView}
          onDirtyChange={handlePasswordDirtyChange}
          onChanged={() => {
            setPasswordDirty(false);
            setPasswordSuccess(true);
            setView("profile");
          }}
        />
      ) : (
        <form
          onSubmit={handleProfileSubmit(submitProfile)}
          className="modal-form"
          noValidate
        >
          <FormField
            id="display-name"
            label="Display name"
            error={profileErrors.displayName?.message}
          >
            <TextField
              id="display-name"
              type="text"
              placeholder="e.g. Alex"
              autoComplete="name"
              maxLength={displayNamePolicy.maxLength}
              autoFocus
              data-modal-initial-focus
              aria-invalid={profileErrors.displayName ? "true" : undefined}
              aria-describedby={
                profileErrors.displayName ? "display-name-error" : undefined
              }
              {...register("displayName")}
            />
          </FormField>

          <div className="avatar-settings">
            <div className="avatar-color-choice-row">
              <fieldset className="avatar-color-controls">
                <legend className="login-hint">Avatar color</legend>
                <div className="avatar-swatches mb-0">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      className={`avatar-swatch ${c.name === avatarColor ? "selected" : ""}`}
                      style={{ backgroundColor: c.hex }}
                      aria-label={`Use ${c.name} avatar color`}
                      aria-pressed={c.name === avatarColor}
                      onClick={() => setAvatarColor(c.name)}
                    />
                  ))}
                </div>
              </fieldset>
              <div
                className="avatar-preview"
                role="img"
                aria-label={`Avatar preview: ${avatarEmoji ?? avatarInitial(displayName ?? "")} on ${avatarColor} background`}
              >
                <span className="avatar-preview-label">Preview</span>
                <span
                  className="avatar-preview-badge"
                  style={{ backgroundColor: avatarColorHex(avatarColor) }}
                  aria-hidden="true"
                >
                  {avatarEmoji ?? avatarInitial(displayName ?? "")}
                </span>
              </div>
            </div>

            <fieldset className="m-0 border-0 p-0">
              <legend className="login-hint mb-2">Avatar emoji</legend>
              <div className="avatar-emoji-grid">
                {pickingCustomEmoji ? (
                  <input
                    id="custom-avatar-emoji"
                    ref={customEmojiInputRef}
                    type="text"
                    className="avatar-emoji-option avatar-emoji-input"
                    value={customEmojiDraft}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      if (nextValue === "") {
                        setCustomEmojiDraft("");
                        return;
                      }
                      if (isIncompleteEmojiInput(nextValue)) {
                        setCustomEmojiDraft(nextValue);
                        return;
                      }
                      addCustomEmoji(nextValue);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") cancelCustomEmoji();
                    }}
                    placeholder="😊"
                    aria-label="Add a custom avatar emoji"
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    className="avatar-emoji-option"
                    aria-label="Add a custom avatar emoji"
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
                    aria-pressed={e === avatarEmoji}
                    onClick={() => {
                      cancelCustomEmoji();
                      selectAvatarEmoji(e);
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
              {pickingCustomEmoji && (
                <p
                  id="custom-avatar-emoji-hint"
                  className="avatar-emoji-hint mt-2"
                >
                  Use your device&apos;s emoji picker, or paste one emoji.
                </p>
              )}
            </fieldset>
          </div>

          <section
            className="settings-section"
            aria-labelledby="account-security"
          >
            <h3 id="account-security" className="settings-section-title">
              Account security
            </h3>
            <button
              type="button"
              className="settings-action"
              onClick={() => {
                setPasswordSuccess(false);
                setView("password");
              }}
            >
              <span className="settings-action-copy">
                <span className="settings-action-title">Change password</span>
                <span className="settings-action-description">
                  Update the password you use to sign in.
                </span>
              </span>
              <span className="settings-action-icon" aria-hidden="true">
                ›
              </span>
            </button>
            {passwordSuccess && (
              <p className="text-green text-sm" role="status">
                Password changed.
              </p>
            )}
          </section>

          {profileErrors.root?.message && (
            <p className="form-error" role="alert">
              {profileErrors.root.message}
            </p>
          )}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={requestClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={isSubmitting}>
              {profileSubmitLabel}
            </button>
          </div>
        </form>
      )}
      <ConfirmationModal
        open={discardTarget !== null}
        title="Discard unsaved changes?"
        message={
          discardTarget === "profile"
            ? "Your new password will not be saved."
            : "Your unsaved changes will be lost."
        }
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        variant="danger"
        onCancel={() => setDiscardTarget(null)}
        onConfirm={() => {
          if (discardTarget === "profile") {
            setPasswordDirty(false);
            setView("profile");
          } else {
            onClose();
          }
          setDiscardTarget(null);
        }}
      />
    </Modal>
  );
}
