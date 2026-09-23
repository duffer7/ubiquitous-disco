"use client";

import { createContext, useContext, useMemo } from "react";

import { DEFAULT_LOCALE, locales, type Locale, type Messages } from "./config";

/**
 * Client-side i18n context.
 *
 * The root layout wraps the app in `<I18nProvider>` with the active locale's
 * catalogue, so client components can call `useMessages()` / `useI18n()` to
 * read translations without importing the catalogue directly.
 */
const I18nContext = createContext<Messages | null>(null);

export function I18nProvider({
  locale = DEFAULT_LOCALE,
  children,
}: {
  locale?: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo(() => locales[locale] ?? locales[DEFAULT_LOCALE], [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Returns the full message catalogue for the active locale. */
export function useMessages(): Messages {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useMessages must be used within an <I18nProvider>.");
  }
  return ctx;
}

/** Alias for `useMessages()` — reads the active catalogue. */
export function useI18n(): Messages {
  return useMessages();
}

