import type { Metadata } from "next";
import type { Route } from "next";

import Link from "next/link";

import { ActivityFilters } from "@/components/dashboard/activity-filters";
import { ActivityList } from "@/components/dashboard/activity-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { requireUser } from "@/lib/auth";
import { getActivityPage } from "@/lib/db/activity";
import { buildQueryString, parsePage } from "@/lib/utils";
import { getMessages } from "@/i18n/server";

const t = getMessages();
export const metadata: Metadata = { title: t.metadata.activity };

const PAGE_SIZE = 15;

/**
 * Full activity history for the signed-in user, with action and date filters,
 * URL-driven pagination and proper loading/empty/error states.
 */
export default async function ActivityPage({
  searchParams,
}: {
  searchParams: { page?: string; action?: string; from?: string; to?: string };
}) {
  const profile = await requireUser("/dashboard/activity");
  const page = parsePage(searchParams.page);
  const offset = (page - 1) * PAGE_SIZE;

  let data: Awaited<ReturnType<typeof getActivityPage>> = { items: [], total: 0 };
  let loadError = false;
  try {
    data = await getActivityPage({
      userId: profile.id,
      action: searchParams.action?.trim() || undefined,
      from: searchParams.from || undefined,
      to: searchParams.to || undefined,
      limit: PAGE_SIZE,
      offset,
    });
  } catch {
    loadError = true;
  }

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const hasFilters = Boolean(searchParams.action || searchParams.from || searchParams.to);

  const buildHref = (nextPage: number) =>
    `/dashboard/activity${buildQueryString({
      page: nextPage === 1 ? undefined : nextPage,
      action: searchParams.action,
      from: searchParams.from,
      to: searchParams.to,
    })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t.dashboard.activityTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.dashboard.activityPageSubtitle}</p>
      </div>
      <ActivityFilters
        action={searchParams.action}
        from={searchParams.from}
        to={searchParams.to}
      />

      <div className="card">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            {data.total} {data.total === 1 ? t.dashboard.eventsOne : t.dashboard.eventsMany}
          </h2>
        </div>

        <div className="p-6">
          {loadError ? (
            <EmptyState
              title={t.dashboard.activityLoadErrorTitle}
              description={t.dashboard.activityLoadErrorDescription}
              action={
                <Link href={"/dashboard/activity" as Route} className="btn-secondary">
                  {t.dashboard.retry}
                </Link>
              }
            />
          ) : data.items.length === 0 ? (
            <EmptyState
              title={
                hasFilters ? t.dashboard.noMatchingActivityTitle : t.dashboard.noActivityTitle
              }
              description={
                hasFilters
                  ? t.dashboard.noMatchingActivityDescription
                  : t.dashboard.noActivityDescription
              }
              action={
                hasFilters ? (
                  <Link href={"/dashboard/activity" as Route} className="btn-secondary">
                    {t.dashboard.clearFilters}
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <ActivityList items={data.items} />
          )}
        </div>

        <Pagination current={page} totalPages={totalPages} buildHref={buildHref} />
      </div>
    </div>
  );
}

