/**
 * Server-side translation access.
 *
 * Server Components and Server Actions can call `getMessages()` to read the
 * active catalogue directly — no context provider needed. The locale is
 * currently fixed to the default; to support per-request locales, read a
 * cookie/`Accept-Language` header here and pick from `locales`.
 */
import { DEFAULT_LOCALE, locales, type Locale, type Messages } from "./config";

export function getLocale(): Locale {
  return DEFAULT_LOCALE;
}

/** Returns the message catalogue for a locale (defaults to the active one). */
export function getMessages(locale: Locale = getLocale()): Messages {
  return locales[locale] ?? locales[DEFAULT_LOCALE];
}

export type { Messages };
