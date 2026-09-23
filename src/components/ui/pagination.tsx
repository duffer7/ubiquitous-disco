"use client";

import Link from "next/link";
import type { Route } from "next";

import { useMessages } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Sequence of page numbers to render, with `null` representing an ellipsis.
 * Keeps at most `2 * window + 3` items so the control stays compact.
 */
export function pageItems(current: number, totalPages: number, window = 1): (number | null)[] {
  const pages = new Set<number>([1, totalPages]);
  for (let i = current - window; i <= current + window; i += 1) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: (number | null)[] = [];
  let prev = 0;
  for (const page of sorted) {
    if (prev && page - prev > 1) items.push(null);
    items.push(page);
    prev = page;
  }
  return items;
}

/**
 * URL-driven pagination. Renders links that preserve existing query params
 * (pass `params` without the `page` key). Renders nothing for a single page.
 */
export function Pagination({
  current,
  totalPages,
  buildHref,
}: {
  current: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  const t = useMessages();

  if (totalPages <= 1) return null;

  const items = pageItems(current, totalPages);

  return (
    <nav
      aria-label={t.pagination.ariaLabel}

      className="flex items-center justify-between gap-2 border-t border-surface-muted px-6 py-4 text-sm"
    >
      <PaginationLink
        href={buildHref(current - 1)}
        disabled={current <= 1}
        label={t.pagination.previous}
      >
        {t.pagination.previous}
      </PaginationLink>

      <ul className="hidden items-center gap-1 sm:flex">
        {items.map((item, index) =>
          item === null ? (
            <li key={`gap-${index}`} className="px-2 text-zinc-500" aria-hidden>
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={buildHref(item) as Route}
                aria-current={item === current ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3",
                  item === current
                    ? "bg-brand-600 font-medium text-white"
                    : "text-zinc-300 hover:bg-surface-muted",
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ul>

      <span className="sm:hidden">{t.pagination.pageOf(current, totalPages)}</span>
      <PaginationLink
        href={buildHref(current + 1)}
        disabled={current >= totalPages}
        label={t.pagination.next}
      >
        {t.pagination.next}
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={label}
        className="rounded-lg px-3 py-1.5 text-zinc-600"
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href as Route}
      aria-label={label}
      className="rounded-lg px-3 py-1.5 text-zinc-300 hover:bg-surface-muted"
    >
      {children}
    </Link>
  );
}

