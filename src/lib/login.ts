import { z } from "zod";

import { passwordInputPolicy } from "./password";

/** Shared client/server contract for an ordinary sign-in attempt. */
export const loginFormSchema = z.object({
  username: z.string().trim().min(1, "Enter your username"),
  password: z
    .string()
    .min(1, "Enter your password")
    .max(passwordInputPolicy.maxLength, "Password is too long"),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
