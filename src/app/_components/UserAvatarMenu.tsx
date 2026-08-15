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

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function UserAvatarMenu({
  username,
  avatarColor,
  theme,
  hasCountdown,
  onEditCountdown,
}: {
  username: string;
  avatarColor: string;
  theme: ThemeName;
  hasCountdown: boolean;
  onEditCountdown: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(avatarColor);
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
          {username.charAt(0).toUpperCase()}
        </span>
        <span className="avatar-username">{capitalize(username)}</span>
      </button>

      {open && (
        <div className="avatar-popover">
          <p className="avatar-popover-label">
            Signed in as {capitalize(username)}
          </p>
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
          <button
            type="button"
            className="text-subtext hover:text-text mb-2 w-full cursor-pointer text-left text-xs"
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
            Edit couple card deck
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
    </div>
  );
}
