"use client";

import Modal from "@/app/_components/Modal";

export default function ConfirmationModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" for destructive actions (delete), "success" for reversible/positive ones (reactivate). */
  variant?: "danger" | "success";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="modal-message">{message}</p>
      <div className="modal-actions">
        <button
          type="button"
          className="btn-ghost"
          onClick={onCancel}
          data-modal-initial-focus
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={
            variant === "success" ? "btn-success-solid" : "btn-danger-solid"
          }
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
