"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  AVATAR_COLORS,
  avatarColorHex,
  type AvatarColorName,
} from "@/lib/avatar";
import { patchJson } from "@/lib/http";
import { LOGIN_PATH, MANAGE_PATH } from "@/lib/routes";
import { type ThemeName, THEMES } from "@/lib/theme";
import { useClickOutside } from "@/lib/useClickOutside";

import EditProfileModal from "./EditProfileModal";

export default function UserAvatarMenu({
  displayName: initialDisplayName,
  avatarColor,
  theme,
  hasCountdown,
  onEditCountdown,
}: {
  displayName: string;
  avatarColor: string;
  theme: ThemeName;
  hasCountdown: boolean;
  onEditCountdown: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(avatarColor);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [editingProfile, setEditingProfile] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useClickOutside(rootRef, open, () => setOpen(false));

  async function handlePickColor(name: AvatarColorName) {
    setColor(name);
    await patchJson("/api/profile/me", { avatarColor: name });
  }

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
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="avatar-username">{displayName}</span>
      </button>

      {open && (
        <div className="avatar-popover">
          <p className="avatar-popover-label">Signed in as {displayName}</p>
          <div className="avatar-swatches">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                className={`avatar-swatch ${c.name === color ? "selected" : ""}`}
                style={{ backgroundColor: c.hex }}
                aria-label={`Use ${c.name} avatar color`}
                onClick={() => handlePickColor(c.name)}
              />
            ))}
          </div>
          <p className="avatar-popover-label">Theme</p>
          <div className="avatar-swatches">
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
          {/* "Edit profile" belongs with the account/appearance controls above it
              (avatar color, theme) — tight gap, no divider. "Edit countdown" and
              "Deck Studio" are shared couple content, a distinct group, so they get a
              divider (same treatment as the one before Log out) instead of just
              another mb-2 that would read as "all five of these are one flat list". */}
          <button
            type="button"
            className="text-subtext hover:text-text mb-3 w-full cursor-pointer text-left text-xs"
            onClick={() => {
              setOpen(false);
              setEditingProfile(true);
            }}
          >
            Edit profile
          </button>
          <button
            type="button"
            className="text-subtext hover:text-text border-border mb-2 w-full cursor-pointer border-t pt-3 text-left text-xs"
            onClick={() => {
              setOpen(false);
              onEditCountdown();
            }}
          >
            {hasCountdown ? "Edit countdown" : "Create a countdown"}
          </button>
          <Link
            href={MANAGE_PATH}
            className="text-subtext hover:text-text mb-2 block w-full cursor-pointer text-left text-xs"
            onClick={() => setOpen(false)}
          >
            Deck Studio
          </Link>
          <button
            type="button"
            className="avatar-logout"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      )}

      {editingProfile && (
        <EditProfileModal
          initialDisplayName={displayName}
          onClose={() => setEditingProfile(false)}
          onSaved={(newName) => {
            setDisplayName(newName);
            setEditingProfile(false);
          }}
        />
      )}
    </div>
  );
}
