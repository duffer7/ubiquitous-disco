import type { Metadata } from "next";

import { UserFilters } from "@/components/admin/user-filters";
import { UserTable } from "@/components/admin/user-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { listUsers } from "@/lib/db/admin";
import { buildQueryString, parsePage } from "@/lib/utils";
import { getMessages } from "@/i18n/server";
import type { UserRole, UserSort } from "@/types/database.types";

const t = getMessages();
export const metadata: Metadata = { title: t.metadata.adminUsers, description: t.metadata.descriptionAdminUsers };

const PAGE_SIZE = 10;
const VALID_ROLES: UserRole[] = ["client", "admin"];
const VALID_SORTS: UserSort[] = ["created_at", "email", "full_name", "role"];

/**
 * Admin user directory: server-side search, role filter, sorting and
 * pagination. All state lives in the URL so views are shareable/bookmarkable.
 */
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    role?: string;
    sort?: string;
    direction?: string;
  };
}) {
  const page = parsePage(searchParams.page);
  const offset = (page - 1) * PAGE_SIZE;

  const role = VALID_ROLES.includes(searchParams.role as UserRole)
    ? (searchParams.role as UserRole)
    : undefined;
  const sort = VALID_SORTS.includes(searchParams.sort as UserSort)
    ? (searchParams.sort as UserSort)
    : "created_at";
  const direction = searchParams.direction === "asc" ? "asc" : "desc";
  const search = searchParams.search?.trim() || undefined;

  let data: Awaited<ReturnType<typeof listUsers>> = { items: [], total: 0 };
  let loadError = false;
  try {
    data = await listUsers({ search, role, sort, direction, limit: PAGE_SIZE, offset });
  } catch {
    loadError = true;
  }

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const hasFilters = Boolean(search || role);

  const buildHref = (nextPage: number) =>
    `/admin/users${buildQueryString({
      search,
      role,
      sort: sort === "created_at" ? undefined : sort,
      direction: direction === "desc" ? undefined : direction,
      page: nextPage === 1 ? undefined : nextPage,
    })}`;

  const buildSortHref = (column: UserSort, nextDirection: "asc" | "desc") =>
    `/admin/users${buildQueryString({
      search,
      role,
      sort: column === "created_at" && nextDirection === "desc" ? undefined : column,
      direction: nextDirection === "desc" ? undefined : nextDirection,
    })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">{t.admin.usersTitle}</h1>
        <p className="mt-1 text-sm text-zinc-400">{t.admin.usersSubtitle}</p>
      </div>
      <UserFilters search={search} role={role} sort={sort} direction={direction} />

      <div className="card overflow-hidden">
        <div className="border-b border-surface-muted px-6 py-4">
          <h2 className="text-sm font-semibold text-zinc-50">
            {data.total} {data.total === 1 ? t.admin.userCountOne : t.admin.userCountMany}
          </h2>
        </div>

        {loadError ? (
          <div className="p-6">
            <EmptyState
              title={t.admin.usersLoadErrorTitle}
              description={t.admin.usersLoadErrorDescription}
            />
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={
                hasFilters ? t.admin.noUsersMatchTitle : t.admin.noUsersDirectoryTitle
              }
              description={
                hasFilters
                  ? t.admin.noUsersMatchDescription
                  : t.admin.noUsersDirectoryDescription
              }
            />
          </div>
        ) : (
          <UserTable
            users={data.items}
            sort={sort}
            direction={direction}
            buildSortHref={buildSortHref}
          />
        )}

        <Pagination current={page} totalPages={totalPages} buildHref={buildHref} />
      </div>
    </div>
  );
}


