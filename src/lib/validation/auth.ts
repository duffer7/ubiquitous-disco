/**
 * Zod schemas shared between client forms and server actions.
 *
 * Defining validation once and reusing it in both places guarantees the
 * server never trusts client-side validation alone.
 */
import { z } from "zod";

import { getMessages } from "@/i18n/server";

const v = getMessages().validation;

export const emailSchema = z
  .string()
  .min(1, v.emailRequired)
  .transform((v) => v.trim().toLowerCase())
  .pipe(z.string().email(v.emailInvalid));

export const passwordSchema = z
  .string()
  .min(8, v.passwordMin)
  .max(72, v.passwordMax)
  .regex(/[a-zA-Z]/, v.passwordLetter)
  .regex(/[0-9]/, v.passwordNumber);
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, v.passwordRequired),
});

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(2, v.fullNameMin)
    .max(120, v.fullNameMax)
    .transform((v) => v.trim()),
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: v.passwordsDoNotMatch,
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

