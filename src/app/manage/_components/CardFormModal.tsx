"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import ConfirmationModal from "@/app/_components/ConfirmationModal";
import FormField from "@/app/_components/FormField";
import Modal from "@/app/_components/Modal";
import Select from "@/app/_components/Select";
import { type Level, LEVEL_META } from "@/data/cards";
import { cardFormSchema, type CardFormValues } from "@/lib/card";
import type { DbCard } from "@/lib/db";
import { postJson } from "@/lib/http";

const LEVEL_OPTIONS = Object.entries(LEVEL_META).map(([value, meta]) => ({
  value,
  label: `${meta.emoji} ${meta.label}`,
}));

export default function CardFormModal({
  card,
  onClose,
  onSubmit,
}: {
  /** Card being edited, or undefined when adding a new one. */
  card?: DbCard;
  onClose: () => void;
  onSubmit: (level: Level, question: string) => Promise<boolean>;
}) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      level: card?.level ?? "1",
      question: card?.question ?? "",
    },
    mode: "onTouched",
  });
  const level = useWatch({ control, name: "level" });
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  let submitLabel = card ? "Save changes" : "Add card";
  if (isSubmitting) submitLabel = "Saving...";

  function requestClose() {
    if (isSubmitting || drafting) return;
    if (isDirty) {
      setConfirmingDiscard(true);
      return;
    }
    onClose();
  }

  async function submit({ level: submittedLevel, question }: CardFormValues) {
    const saved = await onSubmit(submittedLevel, question);
    if (!saved) {
      setError("root", {
        message:
          "Couldn't save your card — check your connection and try again.",
      });
    }
  }

  async function handleDraftWithAi() {
    // Disabling the button for the duration of the request (via `drafting`) is the
    // real guard against someone mashing the click — the request itself is also
    // rate-limited server-side (see /api/ai-cards/draft) as a backstop against
    // multiple tabs/requests firing around the client-side disable.
    setDrafting(true);
    setDraftError(null);
    try {
      const { ok, data } = await postJson<{ level: Level; question: string }>(
        "/api/ai-cards/draft",
        { level },
      );
      if (ok && data) {
        setValue("question", data.question, { shouldDirty: true });
        return;
      }
      setDraftError(
        "Couldn't draft a question — check your connection and try again.",
      );
    } catch {
      setDraftError(
        "Couldn't draft a question — check your connection and try again.",
      );
    } finally {
      setDrafting(false);
    }
  }

  return (
    <Modal open onClose={requestClose} title={card ? "Edit card" : "Add card"}>
      <form onSubmit={handleSubmit(submit)} className="modal-form" noValidate>
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="sr-only">Card details</legend>
          <fieldset className="m-0 border-0 p-0">
            <legend className="login-hint mb-1">Card level</legend>
            <Select
              value={level}
              onChange={(value) =>
                setValue("level", value as Level, { shouldDirty: true })
              }
              options={LEVEL_OPTIONS}
              label="Card level"
            />
          </fieldset>
          <FormField
            id="card-question"
            label="Question or dare"
            error={errors.question?.message}
          >
            <textarea
              id="card-question"
              placeholder="e.g. What's a small thing that made you smile today?"
              className="input textarea"
              autoFocus
              data-modal-initial-focus
              rows={4}
              maxLength={1000}
              aria-invalid={errors.question ? "true" : undefined}
              aria-describedby={
                errors.question ? "card-question-error" : undefined
              }
              {...register("question")}
            />
          </FormField>
        </fieldset>
        {!card && (
          <button
            type="button"
            className="btn-ghost"
            onClick={handleDraftWithAi}
            disabled={drafting}
          >
            {drafting ? "Drafting..." : "🤖 Ask AI to draft one"}
          </button>
        )}
        {(draftError || errors.root?.message) && (
          <p className="form-error" role="alert">
            {draftError ?? errors.root?.message}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={requestClose}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={isSubmitting}>
            {submitLabel}
          </button>
        </div>
      </form>
      <ConfirmationModal
        open={confirmingDiscard}
        title="Discard unsaved changes?"
        message="Your card changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        variant="danger"
        onCancel={() => setConfirmingDiscard(false)}
        onConfirm={onClose}
      />
    </Modal>
  );
}
