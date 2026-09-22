"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "@/lib/auth/session";
import {
  consumePasswordResetToken,
  verifyPasswordResetToken,
} from "@/lib/db/password-reset";
import {
  createProfile,
  findCredentialsByEmail,
  findProfileByEmail,
  logActivity,
  updatePassword,
} from "@/lib/db/users";
import type { ActionState } from "@/lib/form-state";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/auth";

function toFieldErrors(error: { issues: { path: (string | number)[]; message: string }[] }) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

async function setSessionCookie(userId: string, role: "client" | "admin") {
  const token = await createSessionToken({ userId, role });
  cookies().set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

// ---------------------------------------------------------------------------
// Sign up
// ---------------------------------------------------------------------------
export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  }

  const { fullName, email, password } = parsed.data;

  if (await findProfileByEmail(email)) {
    return { status: "error", message: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const profile = await createProfile({ email, passwordHash, fullName });
  await logActivity(profile.id, "account.created", { email });
  await setSessionCookie(profile.id, profile.role);

  redirect("/dashboard");
}

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------
export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  }

  const credentials = await findCredentialsByEmail(parsed.data.email);
  if (!credentials || !(await verifyPassword(parsed.data.password, credentials.passwordHash))) {
    return { status: "error", message: "Invalid email or password." };
  }

  await logActivity(credentials.profile.id, "auth.signed_in");
  await setSessionCookie(credentials.profile.id, credentials.profile.role);

  const redirectTo = (formData.get("redirectedFrom") as string) || "/dashboard";
  redirect(safeRedirect(redirectTo));
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------
export async function signOutAction(): Promise<void> {
  cookies().set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------
export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  }

  const { createPasswordResetToken } = await import("@/lib/db/password-reset");
  const token = await createPasswordResetToken(parsed.data.email);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const base = {
    status: "success" as const,
    message: "If an account exists for that email, a reset link has been sent.",
  };

  // DEV ONLY: surface the link so the flow is testable without email delivery.
  if (process.env.NODE_ENV !== "production" && token) {
    return { ...base, message: `${base.message} (dev) ${siteUrl}/reset-password?token=${token}` };
  }

  return base;
}

// ---------------------------------------------------------------------------
// Reset password (token comes from the emailed link)
// ---------------------------------------------------------------------------
export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  if (!token) {
    return { status: "error", message: "Missing reset token." };
  }

  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  }

  const verified = await verifyPasswordResetToken(token);
  if (!verified) {
    return {
      status: "error",
      message: "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await updatePassword(verified.userId, passwordHash);
  await consumePasswordResetToken(verified.tokenId);
  await logActivity(verified.userId, "auth.password_reset");

  redirect("/login?reset=success");
}

/**
 * Only allow redirects to same-origin relative paths to prevent open
 * redirects (e.g. `?redirectedFrom=https://evil.com`).
 */
function safeRedirect(target: string): string {
  if (target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  return "/dashboard";
}
