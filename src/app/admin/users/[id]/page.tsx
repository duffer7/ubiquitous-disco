import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteUserForm } from "@/components/admin/delete-user-form";
import { UserEditForm } from "@/components/admin/user-edit-form";
import { RoleBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { requireAdmin } from "@/lib/auth";
import { findUserById } from "@/lib/db/admin";
import { getActivityPage } from "@/lib/db/activity";
import { formatDate, formatRelative, humanizeAction, initials } from "@/lib/utils";
import { getMessages } from "@/i18n/server";

const t = getMessages();
export const metadata: Metadata = { title: t.metadata.adminUser };

/** Admin detail view: edit a user, see their recent activity, delete. */
export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const admin = await requireAdmin(`/admin/users/${params.id}`);

  const user = await findUserById(params.id);
  if (!user) notFound();

  const activity = await getActivityPage({ userId: user.id, limit: 10 });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={"/admin/users" as Route}
          className="text-xs font-medium text-brand-600 hover:underline"
        >
          {t.admin.backToUsers}
        </Link>
      </div>

      {/* Header */}
      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700"
          >
            {initials(user.full_name, user.email)}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{user.full_name || "—"}</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <RoleBadge role={user.role} />
      </div>

      {/* Overview stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t.admin.totalActivity}
          value={activity.total}
          hint={t.admin.totalActivityHint}
        />
        <StatCard
          label={t.admin.joined}
          value={formatDate(user.created_at).split(",")[0] ?? "—"}
        />
        <StatCard label={t.admin.lastUpdated} value={formatRelative(user.updated_at)} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Edit form */}
        <section className="card lg:col-span-2">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">{t.admin.editUser}</h2>
            <p className="text-xs text-slate-500">{t.admin.editUserSubtitle}</p>
          </div>
          <div className="p-6">
            <UserEditForm user={user} />
          </div>
        </section>

        <div className="space-y-6">
          {/* Recent activity */}
          <section className="card">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">{t.admin.recentActivity}</h2>
            </div>
            <div className="p-6">
              {activity.items.length === 0 ? (
                <EmptyState
                  title={t.admin.noActivityTitle}
                  description={t.admin.noActivityDescription}
                />
              ) : (
                <ul className="space-y-3">
                  {activity.items.map((log) => (
                    <li key={log.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-slate-700">
                        {humanizeAction(log.action, t.activityActions)}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatRelative(log.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Danger zone — not for the acting admin's own account */}
          {admin.id !== user.id && (
            <section className="card border-red-200">
              <div className="border-b border-red-100 px-6 py-4">
                <h2 className="text-sm font-semibold text-red-700">{t.admin.dangerZone}</h2>
        </div>
              <div className="p-6">
                <DeleteUserForm userId={user.id} email={user.email} />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

