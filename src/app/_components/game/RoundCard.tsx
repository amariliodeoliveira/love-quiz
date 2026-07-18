import type { LevelMeta } from "@/data/cards";

/** Big, minimal-distraction reading view for the currently drawn truth or dare — meant
 * to be read aloud on a call. Shared visual treatment for both, different action buttons
 * passed in as children. */
export default function RoundCard({
  meta,
  question,
  children,
  skipLabel,
  onSkip,
}: {
  meta: LevelMeta;
  question: string;
  children: React.ReactNode;
  /** Smaller underlined link below the main actions — only truths have a "skip" of this kind. */
  skipLabel?: string;
  onSkip?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-16 text-center">
      <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
        {meta.emoji} {meta.label}
      </p>
      <p className="mx-auto max-w-lg font-serif text-2xl leading-snug text-text">
        {question}
      </p>
      <div className="flex flex-wrap justify-center gap-2">{children}</div>
      {skipLabel && onSkip && (
        <button
          type="button"
          className="cursor-pointer text-xs text-muted underline underline-offset-2 hover:text-subtext"
          onClick={onSkip}
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
}
