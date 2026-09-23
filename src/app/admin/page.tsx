import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { StatCard } from "@/components/ui/stat-card";
import { Badge, RoleBadge } from "@/components/ui/badge";
import { getUserStats, listUsers } from "@/lib/db/admin";
import { getActivityPage } from "@/lib/db/activity";
import { formatRelative, humanizeAction } from "@/lib/utils";
import { getMessages } from "@/i18n/server";

const t = getMessages();
export const metadata: Metadata = { title: t.metadata.admin };

/** Admin overview: aggregate user statistics + recent platform activity. */
export default async function AdminPage() {
  const [stats, recentUsers, recentActivity] = await Promise.all([
    getUserStats(),
    listUsers({ limit: 5, sort: "created_at", direction: "desc" }),
    getActivityPage({ limit: 8 }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t.admin.overviewTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.admin.overviewSubtitle}</p>
        </div>
        <Link href="/admin/users" className="btn-primary">
          {t.admin.manageUsers}
        </Link>
      </div>

      {/* Aggregate statistics */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label={t.admin.statTotalUsers} value={stats.total} />
        <StatCard label={t.admin.statAdmins} value={stats.admins} />
        <StatCard label={t.admin.statClients} value={stats.clients} />
        <StatCard
          label={t.admin.statNew7}
          value={stats.newLast7Days}
          hint={t.admin.statNew30Hint(stats.newLast30Days)}
        />
        <StatCard
          label={t.admin.statActive7}
          value={stats.activeLast7Days}
          hint={t.admin.statActive7Hint}
        />
        <StatCard
          label={t.admin.statAdminShare}
          value={stats.total ? `${Math.round((stats.admins / stats.total) * 100)}%` : "0%"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Newest users */}
        <section className="card">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">{t.admin.newestUsers}</h2>
            <Link href="/admin/users" className="text-xs font-medium text-brand-600 hover:underline">
              {t.admin.viewAll}
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentUsers.items.length === 0 ? (
              <li className="px-6 py-6 text-sm text-slate-500">{t.admin.noUsersYet}</li>
            ) : (
              recentUsers.items.map((user) => (
                <li key={user.id}>
                  <Link
                    href={`/admin/users/${user.id}` as Route}
                    className="flex items-center justify-between gap-4 px-6 py-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {user.full_name || user.email}
                      </p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <RoleBadge role={user.role} />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Recent platform activity */}
        <section className="card">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              {t.admin.recentPlatformActivity}
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentActivity.items.length === 0 ? (
              <li className="px-6 py-6 text-sm text-slate-500">{t.admin.noActivityYet}</li>
            ) : (
              recentActivity.items.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-4 px-6 py-3">
                  <Badge>{humanizeAction(log.action, t.activityActions)}</Badge>
                  <span className="text-xs text-slate-500">{formatRelative(log.created_at)}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

