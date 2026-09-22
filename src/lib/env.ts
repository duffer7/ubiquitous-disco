/**
 * Centralised, validated environment configuration.
 *
 * Two groups of variables:
 *  - Public (`NEXT_PUBLIC_*`): safe to reference from the browser. Baked in
 *    at build time by Next.js.
 *  - Server-only: secrets that must never reach the client bundle. Accessed
 *    through `getServerEnv()`, which is only imported from server code.
 *
 * Values are validated lazily (on first use) rather than at import time, so
 * that `next build` does not fail during static analysis when secrets are
 * absent from the build environment.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Public configuration
// ---------------------------------------------------------------------------
const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

export type PublicEnv = z.infer<typeof publicSchema>;

let cachedPublicEnv: PublicEnv | null = null;

export function getPublicEnv(): PublicEnv {
  if (cachedPublicEnv) return cachedPublicEnv;

  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid public environment configuration:\n${issues}`);
  }

  cachedPublicEnv = parsed.data;
  return cachedPublicEnv;
}

export const env = {
  get siteUrl() {
    return getPublicEnv().NEXT_PUBLIC_SITE_URL;
  },
} as const;

// ---------------------------------------------------------------------------
// Server-only configuration
// ---------------------------------------------------------------------------
const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters for adequate security"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cachedServerEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid server environment configuration. Did you copy .env.example to .env.local?\n${issues}`,
    );
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

