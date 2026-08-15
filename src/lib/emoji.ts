import twemoji from "@twemoji/api";

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Renders `text` as HTML with emoji replaced by Twemoji SVGs — guarantees identical
 * emoji (including flags, which many platforms render as plain letter codes or not at
 * all) across every OS/browser, instead of depending on whichever emoji font happens
 * to be installed locally. `text` is HTML-escaped first, so this is safe to use with
 * user-provided text via `dangerouslySetInnerHTML`.
 */
export function emojiHtml(text: string): string {
  return twemoji.parse(escapeHtml(text), {
    className: "emoji",
    folder: "svg",
    ext: ".svg",
  });
}
