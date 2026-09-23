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

export const metadata: Metadata = { title: t.metadata.dashboard, description: t.metadata.descriptionDashboard };

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

  // Derive a simple Pulse Score from account signals (activity volume, profile
  // completeness, recency). Reinforces Orbit's "product health" metaphor.
  const profileComplete = [profile.full_name, profile.company, profile.phone].filter(
    Boolean,
  ).length;
  const rawPulse = Math.round(40 + Math.min(activity.length, 10) * 3 + profileComplete * 8);
  const pulseScore = Math.max(0, Math.min(100, rawPulse));
  const pulseLabel =
    pulseScore >= 80
      ? t.dashboard.pulseActive
      : pulseScore >= 50
        ? t.dashboard.pulseSteady
        : t.dashboard.pulseAtRisk;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">
          {t.dashboard.welcomeBack(profile.full_name?.split(" ")[0] || t.dashboard.welcomeFallback)}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">{t.dashboard.snapshotSubtitle}</p>
      </div>

      {searchParams.error === "forbidden" && (
        <Alert variant="error">{t.dashboard.forbidden}</Alert>
      )}

      {/* Product Pulse — the headline health metric. */}
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {t.dashboard.pulseTitle}
            </p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-orbit-gradient text-4xl font-bold">{pulseScore}</span>
              <span className="text-sm text-zinc-500">/ 100</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">{t.dashboard.pulseHint(pulseScore)}</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="inline-flex items-center gap-2 rounded-full border border-surface-muted bg-surface px-3 py-1 text-xs font-medium text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-orbit-gradient" />
              {pulseLabel}
            </span>
            <p className="mt-2 max-w-xs text-xs text-zinc-500">{t.dashboard.pulseSubtitle}</p>
          </div>
        </div>
      </section>

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
        <div className="flex items-center justify-between border-b border-surface-muted px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">{t.dashboard.recentActivity}</h2>
            <p className="text-xs text-zinc-500">{t.dashboard.recentActivitySubtitle}</p>
          </div>
          <Link
            href={"/dashboard/activity" as Route}
            className="text-xs font-medium text-brand-400 hover:underline"
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
            <ul className="divide-y divide-surface-muted">
              {activity.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {humanizeAction(log.action, t.activityActions)}
                    </p>
                    <p className="text-xs text-zinc-500" title={formatDate(log.created_at)}>
                      {formatRelative(log.created_at)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs text-zinc-400">
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
