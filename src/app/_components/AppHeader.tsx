"use client";

import Link from "next/link";
import { useState } from "react";

import type { CountdownDisplay } from "@/lib/countdown";
import type { DbUser } from "@/lib/db";

import CountdownBubble from "./countdown/CountdownBubble";
import CountdownForm, {
  type CountdownFormInitial,
} from "./countdown/CountdownForm";
import CountdownView from "./countdown/CountdownView";
import Logo from "./Logo";
import Modal from "./Modal";
import UserAvatarMenu from "./UserAvatarMenu";

export default function AppHeader({
  backHref,
  backLabel,
  showCountdownBubble = true,
  user,
  countdown: initialCountdown,
}: {
  backHref?: string;
  backLabel?: string;
  /** The floating countdown bubble is global by default (every logged-in route) —
   * set false only for the /manage settings screens, where it'd be a distraction. */
  showCountdownBubble?: boolean;
  user: Pick<
    DbUser,
    "username" | "displayName" | "avatarColor" | "avatarEmoji" | "theme"
  > | null;
  countdown: CountdownDisplay | null;
}) {
  const [countdown, setCountdown] = useState(initialCountdown);
  const [anchoredAt, setAnchoredAt] = useState(() => Date.now());
  const [viewingCountdown, setViewingCountdown] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState(false);

  const formInitial: CountdownFormInitial | null = countdown
    ? {
        label: countdown.label,
        location: countdown.location,
        timeZone: countdown.timeZone,
        targetAtIso: countdown.targetAtIso,
      }
    : null;

  return (
    <>
      <header className="profile-header">
        {backHref && backLabel && (
          <Link href={backHref} className="profile-back-link">
            {backLabel}
          </Link>
        )}

        {!backHref && <Logo />}

        {user && (
          <UserAvatarMenu
            displayName={user.displayName}
            avatarColor={user.avatarColor}
            avatarEmoji={user.avatarEmoji}
            theme={user.theme}
            hasCountdown={countdown !== null}
            onEditCountdown={() => setEditingCountdown(true)}
          />
        )}
      </header>

      {showCountdownBubble && countdown && (
        <CountdownBubble
          msRemaining={countdown.msRemaining}
          anchoredAt={anchoredAt}
          label={countdown.label}
          onClick={() => setViewingCountdown(true)}
        />
      )}

      <Modal
        open={viewingCountdown}
        onClose={() => setViewingCountdown(false)}
        panelClassName="max-w-lg"
      >
        {countdown && (
          <CountdownView
            msRemaining={countdown.msRemaining}
            anchoredAt={anchoredAt}
            label={countdown.label}
            location={countdown.location}
            timeZone={countdown.timeZone}
            targetAtIso={countdown.targetAtIso}
          />
        )}
      </Modal>

      <Modal
        open={editingCountdown}
        onClose={() => setEditingCountdown(false)}
        title="Countdown"
      >
        <CountdownForm
          initial={formInitial}
          onCancel={() => setEditingCountdown(false)}
          onSaved={(result) => {
            setAnchoredAt(Date.now());
            setCountdown({
              msRemaining: new Date(result.targetAtIso).getTime() - Date.now(),
              label: result.label,
              location: result.location,
              timeZone: result.timeZone,
              targetAtIso: result.targetAtIso,
            });
            setEditingCountdown(false);
          }}
        />
      </Modal>
    </>
  );
}
