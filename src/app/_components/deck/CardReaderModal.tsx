import type { Card, LevelMeta } from "@/data/cards";
import Modal from "./Modal";

/** Big, minimal-distraction reading view for a drawn card — meant to be read aloud on
 * a call, not browsed. Editing/answering happens elsewhere; this only shows and advances. */
export default function CardReaderModal({
  open,
  card,
  meta,
  emptyMessage,
  onMarkAnsweredAndNext,
  onDrawDareInstead,
  onSkip,
  onMinimize,
  onClose,
  onResetProgress,
}: {
  open: boolean;
  card: Card | null;
  meta: LevelMeta | null;
  emptyMessage: string | null;
  onMarkAnsweredAndNext: () => void;
  onDrawDareInstead: () => void;
  onSkip: () => void;
  onMinimize: () => void;
  onClose: () => void;
  onResetProgress: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} panelClassName="max-w-lg">
      <div className="flex flex-col items-center gap-6 py-2 text-center">
        {emptyMessage ? (
          <>
            <p className="font-serif text-xl text-text">{emptyMessage}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Close
              </button>
              <button type="button" className="btn" onClick={onResetProgress}>
                Reset progress
              </button>
            </div>
          </>
        ) : card && meta ? (
          <>
            <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
              {meta.emoji} {meta.label}
            </p>
            <p className="font-serif text-2xl leading-snug text-text">{card.question}</p>

            <div className="flex flex-wrap justify-center gap-2">
              {card.level !== "dare" && (
                <button type="button" className="btn-ghost" onClick={onDrawDareInstead}>
                  😈 Take a dare instead
                </button>
              )}
              <button type="button" className="btn-ghost" onClick={onMinimize}>
                Minimize
              </button>
              <button type="button" className="btn" onClick={onMarkAnsweredAndNext}>
                Mark answered &amp; next
              </button>
            </div>

            <button
              type="button"
              className="cursor-pointer text-xs text-muted underline underline-offset-2 hover:text-subtext"
              onClick={onSkip}
            >
              Skip this one
            </button>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
