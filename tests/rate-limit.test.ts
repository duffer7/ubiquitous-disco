import { afterEach, describe, expect, it, vi } from "vitest";

import { getClientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Each test uses a unique key so the shared in-module bucket store does not
 * leak state between cases.
 */
let counter = 0;
const uniqueKey = (prefix: string) => `${prefix}:${counter++}:${Math.random()}`;

afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("allows requests up to the limit", () => {
    const key = uniqueKey("allow");
    for (let i = 0; i < 3; i += 1) {
      expect(rateLimit(key, { limit: 3, windowMs: 1000 }).ok).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit", () => {
    const key = uniqueKey("block");
    for (let i = 0; i < 3; i += 1) rateLimit(key, { limit: 3, windowMs: 1000 });

    const result = rateLimit(key, { limit: 3, windowMs: 1000 });
    expect(result.ok).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("reports the remaining budget while under the limit", () => {
    const key = uniqueKey("remaining");
    expect(rateLimit(key, { limit: 5, windowMs: 1000 }).remaining).toBe(4);
    expect(rateLimit(key, { limit: 5, windowMs: 1000 }).remaining).toBe(3);
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    const key = uniqueKey("reset");
    rateLimit(key, { limit: 1, windowMs: 1000 });
    expect(rateLimit(key, { limit: 1, windowMs: 1000 }).ok).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, { limit: 1, windowMs: 1000 }).ok).toBe(true);
  });

  it("tracks keys independently", () => {
    const a = uniqueKey("a");
    const b = uniqueKey("b");
    rateLimit(a, { limit: 1, windowMs: 1000 });
    expect(rateLimit(a, { limit: 1, windowMs: 1000 }).ok).toBe(false);
    expect(rateLimit(b, { limit: 1, windowMs: 1000 }).ok).toBe(true);
  });
});

describe("getClientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    const request = new Request("http://localhost", {
      headers: { "x-real-ip": "198.51.100.9" },
    });
    expect(getClientIp(request)).toBe("198.51.100.9");
  });

  it("returns 'unknown' when no proxy headers are present", () => {
    expect(getClientIp(new Request("http://localhost"))).toBe("unknown");
  });
});
