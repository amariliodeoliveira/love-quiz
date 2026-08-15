"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { avatarColorHex, avatarInitial } from "@/lib/avatar";
import { patchJson } from "@/lib/http";
import { LOGIN_PATH, MANAGE_PATH } from "@/lib/routes";
import { type ThemeName, THEMES } from "@/lib/theme";
import { useClickOutside } from "@/lib/useClickOutside";

import EditProfileModal from "./EditProfileModal";

export default function UserAvatarMenu({
  displayName: initialDisplayName,
  avatarColor,
  avatarEmoji,
  avatarEmojiOptions,
  theme,
  hasCountdown,
  onEditCountdown,
}: {
  displayName: string;
  avatarColor: string;
  avatarEmoji: string | null;
  avatarEmojiOptions: string[] | null;
  theme: ThemeName;
  hasCountdown: boolean;
  onEditCountdown: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(avatarColor);
  const [emoji, setEmoji] = useState(avatarEmoji);
  const [emojiOptions, setEmojiOptions] = useState(avatarEmojiOptions);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [editingProfile, setEditingProfile] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useClickOutside(rootRef, open, () => setOpen(false));

  async function handlePickTheme(name: ThemeName) {
    await patchJson("/api/profile/me", { theme: name });
    // The theme is applied via <html data-theme> in the root layout (server-rendered,
    // so a page refresh never flashes the old theme) — a client-only state update
    // wouldn't touch that attribute, so re-render from the server instead.
    router.refresh();
  }

  async function handleLogout() {
    await fetch("/api/profile/logout", { method: "POST" });
    router.push(LOGIN_PATH);
    router.refresh();
  }

  return (
    <div className="avatar-menu" ref={rootRef}>
      <button
        type="button"
        className="avatar-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span
          className="avatar-badge"
          style={{ backgroundColor: avatarColorHex(color) }}
        >
          {emoji ?? avatarInitial(displayName)}
        </span>
        <span className="avatar-username">{displayName}</span>
      </button>

      {open && (
        <div className="avatar-popover">
          <div className="avatar-menu-row">
            <p className="avatar-popover-label mb-0">Theme</p>
            <div className="avatar-swatches mb-0">
              {THEMES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  className={`avatar-swatch ${t.name === theme ? "selected" : ""}`}
                  style={{ backgroundColor: t.swatchHex }}
                  aria-label={`Use ${t.label} theme`}
                  onClick={() => handlePickTheme(t.name)}
                />
              ))}
            </div>
          </div>
          <div className="avatar-menu-divider" />

          {/* "Edit profile" is a distinct concern from the theme swatches above it
              (appearance vs. account identity), so it gets its own divider rather than
              reading as one flat group. "Edit countdown" and "Deck Studio" are shared
              couple content, a separate group again, so they get the same treatment
              before Log out. The divider is its own plain element, not a border on the
              item itself — a border-radius'd button with just a border-top curves at
              the ends. */}
          <button
            type="button"
            className="avatar-menu-item"
            onClick={() => {
              setOpen(false);
              setEditingProfile(true);
            }}
          >
            Edit profile
          </button>
          <div className="avatar-menu-divider" />
          <button
            type="button"
            className="avatar-menu-item"
            onClick={() => {
              setOpen(false);
              onEditCountdown();
            }}
          >
            {hasCountdown ? "Edit countdown" : "Create a countdown"}
          </button>
          <Link
            href={MANAGE_PATH}
            className="avatar-menu-item"
            onClick={() => setOpen(false)}
          >
            Deck Studio
          </Link>
          <div className="avatar-menu-divider" />
          <button
            type="button"
            className="avatar-menu-item avatar-menu-item-danger"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      )}

      {editingProfile && (
        <EditProfileModal
          initialDisplayName={displayName}
          initialAvatarColor={color}
          initialAvatarEmoji={emoji}
          initialAvatarEmojiOptions={emojiOptions}
          onClose={() => setEditingProfile(false)}
          onSaved={(result) => {
            setDisplayName(result.displayName);
            setColor(result.avatarColor);
            setEmoji(result.avatarEmoji);
            setEmojiOptions(result.avatarEmojiOptions);
            setEditingProfile(false);
          }}
        />
      )}
    </div>
  );
}
