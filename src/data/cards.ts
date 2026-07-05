export type Level = "1" | "2" | "3" | "dare";

export interface Card {
  id: string;
  level: Level;
  question: string;
}

export interface LevelMeta {
  label: string;
  emoji: string;
  className: string;
}

export const LEVEL_META: Record<Level, LevelMeta> = {
  "1": { label: "Level 1 — Light", emoji: "🟢", className: "l1" },
  "2": { label: "Level 2 — Medium", emoji: "🟡", className: "l2" },
  "3": { label: "Level 3 — Heavy", emoji: "🔴", className: "l3" },
  dare: { label: "Dares", emoji: "🟣", className: "ldare" },
};

export const ALL_LEVELS: Level[] = ["1", "2", "3", "dare"];

