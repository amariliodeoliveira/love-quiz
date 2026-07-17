"use client";

import { useState } from "react";
import Link from "next/link";
import type { DbUser } from "@/lib/db";
import type { CountdownDisplay } from "@/lib/countdown";
import UserAvatarMenu from "./UserAvatarMenu";
import CountdownTicker from "./CountdownTicker";
import CountdownView from "./CountdownView";
import Modal from "./Modal";
import CountdownForm, { type CountdownFormInitial } from "./CountdownForm";

export default function AppHeader({
  backHref,
  backLabel,
  user,
  countdown: initialCountdown,
}: {
  backHref: string;
  backLabel: string;
  user: Pick<DbUser, "username" | "avatarColor"> | null;
  countdown: CountdownDisplay | null;
}) {
  const [countdown, setCountdown] = useState(initialCountdown);
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
    <header className="profile-header">
      <Link href={backHref} className="profile-back-link">
        {backLabel}
      </Link>

      {countdown && (
        <CountdownTicker
          msRemaining={countdown.msRemaining}
          label={countdown.label}
          onClick={() => setViewingCountdown(true)}
        />
      )}

      {user && (
        <UserAvatarMenu
          username={user.username}
          avatarColor={user.avatarColor}
          hasCountdown={countdown !== null}
          onEditCountdown={() => setEditingCountdown(true)}
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
    </header>
  );
}
