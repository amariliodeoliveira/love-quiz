"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AVATAR_COLORS, avatarColorHex, type AvatarColorName } from "@/lib/avatar";
import { useClickOutside } from "@/lib/useClickOutside";
import { LOGIN_PATH } from "@/lib/routes";
import { patchJson } from "@/lib/http";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function UserAvatarMenu({
  username,
  avatarColor,
}: {
  username: string;
  avatarColor: string;
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
          <p className="avatar-popover-label">Signed in as {capitalize(username)}</p>
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
          <button type="button" className="avatar-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
