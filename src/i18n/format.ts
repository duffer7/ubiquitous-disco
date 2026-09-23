/**
 * Locale-aware formatting helpers.
 *
 * These replace the hard-coded `Intl` calls that used to live in
 * `lib/utils.ts`. They accept the active locale (defaulting to the app
 * default) so dates and relative times follow the user's language.
 */
import { DEFAULT_LOCALE, type Locale } from "./config";

/** Fallback shown for missing/invalid values (a plain em-dash). */
export const EMPTY_PLACEHOLDER = "—";

/** Format an ISO timestamp for display, falling back gracefully. */
export function formatDate(
  value: string | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (!value) return EMPTY_PLACEHOLDER;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_PLACEHOLDER;
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Human-friendly relative time, e.g. "3 days ago". Falls back to formatDate. */
export function formatRelative(
  value: string | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (!value) return EMPTY_PLACEHOLDER;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_PLACEHOLDER;

  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
  ];

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, ms] of units) {
    if (abs >= ms) {
      return formatter.format(Math.round(diffMs / ms), unit);
    }
  }
  // Less than a minute — "just now" in English, "now" via Intl elsewhere.
  return formatter.format(0, "second");
}

/** Format a plain integer for the active locale (thousands separators). */
export function formatNumber(value: number, locale: Locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale).format(value);
}
