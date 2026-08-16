"use client";

import { useEffect, useId, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** The dialog's intended first control opts in explicitly. */
const INITIAL_FOCUS_SELECTOR = "[data-modal-initial-focus]";

export default function Modal({
  open,
  onClose,
  title,
  ariaLabel,
  panelClassName,
  dismissOnBackdrop = false,
  showCloseButton = true,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Required when no visible title supplies the dialog's accessible name. */
  ariaLabel?: string;
  /** Extra classes for the panel — e.g. a wider `max-w-*` for a richer, expanded modal. */
  panelClassName?: string;
  /** Form dialogs keep their draft by default; read-only dialogs may opt into backdrop dismissal. */
  dismissOnBackdrop?: boolean;
  /** Read-only, backdrop-dismissible panels may omit a redundant close button. */
  showCloseButton?: boolean;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const initialFocus = panel?.querySelector<HTMLElement>(
      INITIAL_FOCUS_SELECTOR,
    );
    const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (initialFocus ?? focusable?.[0] ?? panel)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      const topmostPanel = [
        ...document.querySelectorAll<HTMLElement>("[data-modal-panel]"),
      ].at(-1);
      if (!topmostPanel?.isSameNode(panel)) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;

      const nodes = [
        ...panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ];
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes.at(-1);
      if (!last) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    globalThis.addEventListener("keydown", onKeyDown);

    return () => {
      globalThis.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={dismissOnBackdrop ? onClose : undefined}
    >
      <div
        ref={panelRef}
        data-modal-panel
        className={`modal-panel ${panelClassName ?? ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title ? undefined : ariaLabel}
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <h2 id={titleId} className="modal-title">
              {title}
            </h2>
            {showCloseButton && (
              <button
                type="button"
                className="modal-close"
                onClick={onClose}
                aria-label="Close dialog"
              >
                ×
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
