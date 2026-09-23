import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth";
import { getRecentActivity } from "@/lib/db/activity";
import { formatDate, formatRelative, humanizeAction } from "@/lib/utils";
import { getMessages } from "@/i18n/server";
import type { ActivityLog } from "@/types/database.types";

const t = getMessages();

export const metadata: Metadata = { title: t.metadata.dashboard };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const profile = await requireUser("/dashboard");

  let activity: ActivityLog[] = [];
  let loadError = false;
  try {
    activity = await getRecentActivity(profile.id, 10);
  } catch {
    loadError = true;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {t.dashboard.welcomeBack(profile.full_name?.split(" ")[0] || t.dashboard.welcomeFallback)}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t.dashboard.snapshotSubtitle}</p>
      </div>

      {searchParams.error === "forbidden" && (
        <Alert variant="error">{t.dashboard.forbidden}</Alert>
      )}

      {/* Account summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t.dashboard.accountStatus} value={t.dashboard.active} />
        <StatCard label={t.dashboard.plan} value={t.dashboard.free} hint={t.dashboard.upgradeSoon} />
        <StatCard
          label={t.dashboard.memberSince}
          value={formatDate(profile.created_at).split(",")[0] ?? "—"}
        />
      </section>

      {/* Activity history */}
      <section className="card">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{t.dashboard.recentActivity}</h2>
            <p className="text-xs text-slate-500">{t.dashboard.recentActivitySubtitle}</p>
          </div>
          <Link
            href={"/dashboard/activity" as Route}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            {t.dashboard.viewAll}
          </Link>
        </div>

        <div className="p-6">
          {loadError ? (
            <Alert variant="error">{t.dashboard.activityError}</Alert>
          ) : activity.length === 0 ? (
            <EmptyState
              title={t.dashboard.noActivityTitle}
              description={t.dashboard.noActivityDescription}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {activity.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {humanizeAction(log.action, t.activityActions)}
                    </p>
                    <p className="text-xs text-slate-500" title={formatDate(log.created_at)}>
                      {formatRelative(log.created_at)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                    {log.ip_address ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
