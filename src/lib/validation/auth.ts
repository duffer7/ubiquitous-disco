/**
 * Zod schemas shared between client forms and server actions.
 *
 * Defining validation once and reusing it in both places guarantees the
 * server never trusts client-side validation alone.
 */
import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .transform((v) => v.trim().toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(2, "Please enter your full name")
    .max(120, "Name is too long")
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
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
