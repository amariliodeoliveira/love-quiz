/**
 * Every theme this app supports — the single source of truth for both the picker UI
 * (see UserAvatarMenu) and validation. Adding a new theme means: add an entry here,
 * add a matching `[data-theme="<name>"]` block in globals.css defining every token
 * listed under "THEME TOKENS" there. Nothing else needs to change — the picker UI and
 * the `<html data-theme>` wiring are already generic over this list.
 *
 * `swatchHex` is only for the picker preview dot, not applied anywhere else — pick a
 * color that reads as "this theme" at a glance (its background or dominant accent).
 */
export const THEMES = [
  { name: "dark", label: "Dark", swatchHex: "#16161f" },
  { name: "pink", label: "Pink", swatchHex: "#fbcfe8" },
] as const;

export type ThemeName = (typeof THEMES)[number]["name"];

export const DEFAULT_THEME: ThemeName = "dark";

export function isThemeName(value: unknown): value is ThemeName {
  return THEMES.some((t) => t.name === value);
}
