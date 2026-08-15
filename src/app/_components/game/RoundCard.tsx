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
  badge,
}: {
  meta: LevelMeta;
  question: string;
  children: React.ReactNode;
  /** Smaller underlined link below the main actions — only truths have a "skip" of this kind. */
  skipLabel?: string;
  onSkip?: () => void;
  /** Small pill shown above the level — e.g. flagging an AI-generated card. */
  badge?: string;
}) {
  return (
    <>
      {badge && (
        <span className="border-purple bg-purple-dim text-purple inline-block rounded-full border px-2 py-0.5 text-xs font-medium">
          {badge}
        </span>
      )}
      <p className="text-muted text-xs font-medium tracking-[0.18em] uppercase">
        {meta.emoji} {meta.label}
      </p>
      <p className="text-text mx-auto max-w-lg font-serif text-2xl leading-snug">
        {question}
      </p>
      <div className="flex flex-wrap justify-center gap-2">{children}</div>
      {skipLabel && onSkip && (
        <button
          type="button"
          className="text-muted hover:text-subtext cursor-pointer text-xs underline underline-offset-2"
          onClick={onSkip}
        >
          {skipLabel}
        </button>
      )}
    </>
  );
}
