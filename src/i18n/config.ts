/**
 * i18n configuration.
 *
 * The app ships with a single `en` catalogue but is structured so more locales
 * can be dropped in with no refactor:
 *
 *   1. Copy `src/i18n/locales/en.ts` → `src/i18n/locales/<code>.ts`.
 *   2. Translate the values (leave the keys untouched).
 *   3. Import it below and add it to `locales`.
 *
 * `Messages` is derived from the English catalogue, and every other locale is
 * typed as `Messages`, so a missing/renamed key becomes a TypeScript error.
 */
import en from "./locales/en";

export type Locale = "en";

export const DEFAULT_LOCALE: Locale = "en";

/** All available locales. Extend this when adding a translation. */
export const locales: Record<Locale, Messages> = {
  en,
};

/** The shape of a message catalogue, inferred from English. */
export type Messages = typeof en;
