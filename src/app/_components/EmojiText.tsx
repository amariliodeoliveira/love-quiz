import { emojiHtml } from "@/lib/emoji";

/** Renders text with emoji (including flags) guaranteed to look right everywhere — see src/lib/emoji.ts. */
export default function EmojiText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: emojiHtml(text) }}
    />
  );
}
