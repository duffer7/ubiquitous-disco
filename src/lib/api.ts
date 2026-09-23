import { NextResponse } from "next/server";

import type { ZodError } from "zod";

import { getMessages } from "@/i18n/server";

/**
 * Shared helpers for the REST route handlers under `src/app/api`.
 *
 * Centralises the response shapes so every endpoint returns a consistent
 * contract:
 *   success → { ...payload }            (2xx)
 *   error   → { error: string, fieldErrors?: Record<string, string[]> }
 */

/** Convert a Zod error into a flat `fieldErrors` map (path → messages). */
export function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

/**
 * Parse a JSON request body, returning `null` when the body is missing or
 * malformed. Callers typically respond with `badRequest(...)` on `null`.
 */
export async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** 400 — malformed request (e.g. invalid JSON body). */
export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** 401 — authentication required or invalid credentials. */
export function unauthorized(message?: string) {
  return NextResponse.json({ error: message ?? getMessages().api.authRequired }, { status: 401 });
}

/** 403 — authenticated but not allowed. */
export function forbidden(message?: string) {
  return NextResponse.json(
    { error: message ?? getMessages().api.forbidden },
    { status: 403 },
  );
}

/** 422 — validation failed, with per-field messages. */
export function unprocessable(message: string, fieldErrors?: Record<string, string[]>) {
  return NextResponse.json({ error: message, fieldErrors }, { status: 422 });
}

/** 429 — rate limited, with a `Retry-After` header. */
export function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: getMessages().api.tooManyRequests },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

