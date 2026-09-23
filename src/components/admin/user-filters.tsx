"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/provider";
import type { UserRole, UserSort } from "@/types/database.types";

/**
 * Search & filter bar for the admin user directory. Updates the URL via
 * `router.push`, keeping server-side filtering authoritative and the view
 * shareable. Debouncing is intentionally omitted in favour of an explicit
 * submit for predictable query load; the search field submits on Enter.
 */
export function UserFilters({
  search,
  role,
  sort,
  direction,
}: {
  search?: string;
  role?: UserRole;
  sort: UserSort;
  direction: "asc" | "desc";
}) {
  const t = useMessages();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [term, setTerm] = useState(search ?? "");
  const [roleValue, setRoleValue] = useState<"" | UserRole>(role ?? "");

  const navigate = (params: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) qs.set(key, value);
    }
    startTransition(() => {
      router.push(`/admin/users${qs.toString() ? `?${qs}` : ""}` as Route);
    });
  };

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    // Preserve the current sort while applying search/role filters.
    navigate({
      search: term.trim() || undefined,
      role: roleValue || undefined,
      sort: sort === "created_at" ? undefined : sort,
      direction: direction === "desc" ? undefined : direction,
    });
  };

  const reset = () => {
    setTerm("");
    setRoleValue("");
    startTransition(() => router.push("/admin/users" as Route));
  };

  return (
    <form onSubmit={apply} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="user-search" className="label">
          {t.admin.searchLabel}
        </label>
        <input
          id="user-search"
          name="search"
          type="search"
          className="input"
          placeholder={t.admin.searchPlaceholder}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>

      <div className="sm:w-44">
        <label htmlFor="user-role" className="label">
          {t.admin.roleLabel}
        </label>
        <select
          id="user-role"
          name="role"
          className="input"
          value={roleValue}
          onChange={(e) => setRoleValue(e.target.value as "" | UserRole)}
        >
          <option value="">{t.admin.allRoles}</option>
          <option value="client">{t.admin.roleClients}</option>
          <option value="admin">{t.admin.roleAdmins}</option>
        </select>
      </div>

      {/* Preserve current sort when re-filtering. */}
      <div className="flex gap-2">
        <Button type="submit" isLoading={isPending}>
          {t.common.apply}
        </Button>
        <Button type="button" variant="secondary" onClick={reset} disabled={isPending}>
          {t.common.reset}
        </Button>
      </div>
    </form>
  );
}
