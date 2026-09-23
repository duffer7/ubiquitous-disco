/**
 * Minimal class-name joiner. Kept dependency-free (no clsx/tailwind-merge)
 * to avoid pulling extra packages in for a small helper.
 */

import { formatDate as formatDateI18n, formatRelative as formatRelativeI18n } from "@/i18n/format";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Return initials for an avatar fallback, e.g. "Ada Lovelace" -> "AL". */
export function initials(name: string | null | undefined, email?: string): string {
  const source = name?.trim() || email?.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

/**
 * Turn a dotted activity action into a readable label.
 *
 * Prefers the provided `labels` catalogue (i18n) keyed by the action's last
 * segment (e.g. "auth.signed_in" -> labels["signed_in"]). Falls back to a
 * title-cased version of the raw action so unknown actions still render.
 */
export function humanizeAction(action: string, labels?: Record<string, string>): string {
  const last = action.split(".").pop() ?? action;
  const fromCatalogue = labels?.[last];
  if (fromCatalogue) return fromCatalogue;
  const words = last.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Format an ISO timestamp for display, falling back gracefully.
 * Locale-aware - delegates to the i18n formatting helpers.
 */
export function formatDate(value: string | null | undefined): string {
  return formatDateI18n(value);
}

/**
 * Human-friendly relative time, e.g. "3 days ago".
 * Locale-aware - delegates to the i18n formatting helpers.
 */
export function formatRelative(value: string | null | undefined): string {
  return formatRelativeI18n(value);
}

/**
 * Build a query string from a record, dropping undefined/null/empty values.
 * Used by admin list filters to keep URLs clean and shareable.
 */
export function buildQueryString(
  params: Record<string, string | number | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/** Parse a positive integer from a search param, clamped to a range. */
export function parsePage(value: string | undefined, min = 1, max = 10_000): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) return min;
  return Math.min(Math.max(parsed, min), max);
}
