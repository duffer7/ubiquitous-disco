import "server-only";

/**
 * Minimal in-memory rate limiter (fixed-window).
 *
 * Suitable for a single-instance deployment or as a first line of defence.
 * NOTE: state lives in the process memory, so it does not coordinate across
 * serverless invocations or multiple instances. For horizontally scaled
 * production use, swap the store for Redis/Upstash (same interface).
 *
 * Usage:
 *   const result = rateLimit(`login:${ip}`, { limit: 10, windowMs: 60_000 });
 *   if (!result.ok) return tooManyRequests(result.retryAfterSeconds);
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so the map cannot grow unbounded.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets (present when `ok` is false). */
  retryAfterSeconds: number;
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true, remaining: options.limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > options.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return { ok: true, remaining: options.limit - existing.count, retryAfterSeconds: 0 };
}

/**
 * Best-effort client IP extraction from proxy headers. Falls back to a static
 * key when no header is present (e.g. local dev), so the limiter still applies.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
