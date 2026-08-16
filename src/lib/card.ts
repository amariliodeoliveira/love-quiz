import { z } from "zod";

import { ALL_LEVELS } from "@/data/cards";

export const cardQuestionPolicy = {
  maxLength: 1000,
} as const;

/** Shared client/server contract for a manually created or edited card. */
export const cardFormSchema = z.object({
  level: z.enum(ALL_LEVELS),
  question: z
    .string()
    .trim()
    .min(1, "Enter a question or dare")
    .max(
      cardQuestionPolicy.maxLength,
      `Use at most ${cardQuestionPolicy.maxLength} characters`,
    ),
});

export type CardFormValues = z.infer<typeof cardFormSchema>;
