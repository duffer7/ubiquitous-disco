"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useMessages } from "@/i18n/provider";

/**
 * Client-side filter form. We use `router.push` (rather than a GET form) so
 * the URL stays the single source of truth and Next.js can reuse the server
 * component render. Pagination resets to page 1 on every filter change.
 */
export function ActivityFilters({
  action,
  from,
  to,
}: {
  action?: string;
  from?: string;
  to?: string;
}) {
  const router = useRouter();
  const t = useMessages();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({ action: action ?? "", from: from ?? "", to: to ?? "" });

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (values.action) params.set("action", values.action);
    if (values.from) params.set("from", values.from);
    if (values.to) params.set("to", values.to);
    startTransition(() => {
      router.push(
        `/dashboard/activity${params.toString() ? `?${params}` : ""}` as Route,
      );
    });
  };

  const reset = () => {
    setValues({ action: "", from: "", to: "" });
    startTransition(() => router.push("/dashboard/activity" as Route));
  };

  return (
    <form onSubmit={apply} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          label={t.dashboard.filterAction}
          name="action"
          placeholder={t.dashboard.filterActionPlaceholder}
          value={values.action}
          onChange={(e) => setValues((v) => ({ ...v, action: e.target.value }))}
        />
      </div>
      <div className="sm:w-44">
        <Input
          label={t.dashboard.filterFrom}
          name="from"
          type="date"
          value={values.from ? values.from.slice(0, 10) : ""}
          onChange={(e) => setValues((v) => ({ ...v, from: e.target.value }))}
        />
      </div>
      <div className="sm:w-44">
        <Input
          label={t.dashboard.filterTo}
          name="to"
          type="date"
          value={values.to ? values.to.slice(0, 10) : ""}
          onChange={(e) => setValues((v) => ({ ...v, to: e.target.value }))}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending && <Spinner className="h-4 w-4" />}
          {t.common.apply}
        </button>
        <button type="button" className="btn-secondary" onClick={reset} disabled={isPending}>
          {t.common.reset}
        </button>
      </div>
    </form>
  );
}

