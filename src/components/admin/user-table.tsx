"use client";

import Link from "next/link";
import type { Route } from "next";

import { RoleBadge } from "@/components/ui/badge";
import { useMessages } from "@/i18n/provider";
import { formatRelative, initials } from "@/lib/utils";
import type { UserListItem, UserSort } from "@/types/database.types";

/**
 * Presentational user directory table. Sortable headers are plain links that
 * toggle the `direction` query param — no client JS required. On small
 * screens the table collapses into a stacked card list.
 *
 * `buildSortHref` is provided by the page so sort links preserve the active
 * search / role filters (and reset pagination).
 */
export function UserTable({
  users,
  sort,
  direction,
  buildSortHref,
}: {
  users: UserListItem[];
  sort: UserSort;
  direction: "asc" | "desc";
  buildSortHref: (column: UserSort, direction: "asc" | "desc") => string;
}) {
  const t = useMessages();

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-muted text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <SortHeader
                column="full_name"
                label={t.admin.colUser}
                sort={sort}
                direction={direction}
                buildSortHref={buildSortHref}
              />
              <SortHeader
                column="role"
                label={t.admin.colRole}
                sort={sort}
                direction={direction}
                buildSortHref={buildSortHref}
              />
              <th scope="col" className="px-6 py-3 font-medium">
                {t.admin.colActivity}
              </th>
              <SortHeader
                column="created_at"
                label={t.admin.colJoined}
                sort={sort}
                direction={direction}
                buildSortHref={buildSortHref}
              />
              <th scope="col" className="px-6 py-3 text-right font-medium">
                {t.admin.colActions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-muted">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600/20 text-xs font-semibold text-brand-300"
                    >
                      {initials(user.full_name, user.email)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-100">
                        {user.full_name || "—"}
                      </p>
                      <p className="truncate text-xs text-zinc-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-3 text-zinc-300">
                  <span className="font-medium">{user.activity_count}</span>
                  {user.last_active_at && (
                    <span className="block text-xs text-zinc-500">
                      {formatRelative(user.last_active_at)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-3 text-zinc-400">{formatRelative(user.created_at)}</td>
                <td className="px-6 py-3 text-right">
                  <Link
                    href={`/admin/users/${user.id}` as Route}
                    className="text-xs font-medium text-brand-400 hover:underline"
                  >
                    {t.common.view}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-surface-muted md:hidden">
        {users.map((user) => (
          <li key={user.id}>
            <Link
              href={`/admin/users/${user.id}` as Route}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span
                aria-hidden
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600/20 text-xs font-semibold text-brand-300"
              >
                {initials(user.full_name, user.email)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-100">
                  {user.full_name || user.email}
                </p>
                <p className="truncate text-xs text-zinc-400">{user.email}</p>
              </div>
              <RoleBadge role={user.role} />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function SortHeader({
  column,
  label,
  sort,
  direction,
  buildSortHref,
}: {
  column: UserSort;
  label: string;
  sort: UserSort;
  direction: "asc" | "desc";
  buildSortHref: (column: UserSort, direction: "asc" | "desc") => string;
}) {
  const isActive = sort === column;
  const nextDirection = isActive && direction === "desc" ? "asc" : "desc";
  const href = buildSortHref(column, nextDirection);

  return (
    <th scope="col" className="px-6 py-3 font-medium">
      <Link
        href={href as Route}
        className="inline-flex items-center gap-1 hover:text-zinc-200"
        aria-sort={isActive ? (direction === "asc" ? "ascending" : "descending") : "none"}
      >
        {label}
        <span aria-hidden className={isActive ? "text-brand-400" : "text-zinc-600"}>
          {isActive && direction === "asc" ? "▲" : "▼"}
        </span>
      </Link>
    </th>
  );
}

