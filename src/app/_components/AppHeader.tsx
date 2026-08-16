"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";

import type { CountdownDisplay } from "@/lib/countdown";
import type { DbUser } from "@/lib/db";

import ConfirmationModal from "./ConfirmationModal";
import CountdownBubble from "./countdown/CountdownBubble";
import CountdownForm, {
  type CountdownFormInitial,
  type CountdownFormResult,
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
    | "username"
    | "displayName"
    | "avatarColor"
    | "avatarEmoji"
    | "avatarEmojiOptions"
    | "theme"
  > | null;
  countdown: CountdownDisplay | null;
}) {
  const [countdown, setCountdown] = useState(initialCountdown);
  const [anchoredAt, setAnchoredAt] = useState(() => Date.now());
  const [viewingCountdown, setViewingCountdown] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState(false);
  // Dirty state only affects what a later close action does. Keeping it in a ref avoids
  // re-rendering the entire header when the form first becomes dirty or pristine again.
  const countdownDirty = useRef(false);
  const [confirmingCountdownDiscard, setConfirmingCountdownDiscard] =
    useState(false);

  const formInitial: CountdownFormInitial | null = useMemo(
    () =>
      countdown
        ? {
            label: countdown.label,
            location: countdown.location,
            timeZone: countdown.timeZone,
            targetAtIso: countdown.targetAtIso,
          }
        : null,
    [countdown],
  );

  const openCountdownEditor = useCallback(() => {
    setEditingCountdown(true);
  }, []);
  const openCountdownView = useCallback(() => {
    setViewingCountdown(true);
  }, []);
  const closeCountdownView = useCallback(() => {
    setViewingCountdown(false);
  }, []);
  const requestCountdownEditorClose = useCallback(() => {
    if (countdownDirty.current) {
      setConfirmingCountdownDiscard(true);
    } else {
      setEditingCountdown(false);
    }
  }, []);
  const recordCountdownDirty = useCallback((isDirty: boolean) => {
    countdownDirty.current = isDirty;
  }, []);
  const saveCountdown = useCallback((result: CountdownFormResult) => {
    const now = Date.now();
    setAnchoredAt(now);
    setCountdown({
      msRemaining: new Date(result.targetAtIso).getTime() - now,
      ...result,
    });
    countdownDirty.current = false;
    setEditingCountdown(false);
  }, []);
  const keepEditingCountdown = useCallback(() => {
    setConfirmingCountdownDiscard(false);
  }, []);
  const discardCountdownChanges = useCallback(() => {
    setConfirmingCountdownDiscard(false);
    countdownDirty.current = false;
    setEditingCountdown(false);
  }, []);

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
            avatarEmojiOptions={user.avatarEmojiOptions}
            theme={user.theme}
            hasCountdown={countdown !== null}
            onEditCountdown={openCountdownEditor}
          />
        )}
      </header>

      {showCountdownBubble && countdown && (
        <CountdownBubble
          msRemaining={countdown.msRemaining}
          anchoredAt={anchoredAt}
          label={countdown.label}
          onClick={openCountdownView}
        />
      )}

      <Modal
        open={viewingCountdown}
        onClose={closeCountdownView}
        panelClassName="max-w-lg"
        dismissOnBackdrop
        showCloseButton={false}
        ariaLabel="Countdown"
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
        onClose={requestCountdownEditorClose}
        title="Countdown"
      >
        <CountdownForm
          initial={formInitial}
          onDirtyChange={recordCountdownDirty}
          onCancel={requestCountdownEditorClose}
          onSaved={saveCountdown}
        />
      </Modal>
      <ConfirmationModal
        open={confirmingCountdownDiscard}
        title="Discard unsaved changes?"
        message="Your countdown changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        variant="danger"
        onCancel={keepEditingCountdown}
        onConfirm={discardCountdownChanges}
      />
    </>
  );
}
