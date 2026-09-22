import type { Metadata } from "next";

import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getRecentActivity } from "@/lib/db/activity";
import { formatDate } from "@/lib/utils";
import type { ActivityLog } from "@/types/database.types";

export const metadata: Metadata = { title: "Dashboard" };

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
          Welcome back, {profile.full_name?.split(" ")[0] || "there"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s a snapshot of your account.</p>
      </div>

      {searchParams.error === "forbidden" && (
        <Alert variant="error">You don&apos;t have permission to access that page.</Alert>
      )}

      {/* Account summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Account status" value="Active" />
        <StatCard label="Plan" value="Free" />
        <StatCard label="Member since" value={formatDate(profile.created_at).split(",")[0] ?? "—"} />
      </section>

      {/* Activity history */}
      <section className="card">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
          <p className="text-xs text-slate-500">Your latest account events (basic level).</p>
        </div>

        <div className="p-6">
          {loadError ? (
            <Alert variant="error">We couldn&apos;t load your activity. Please refresh.</Alert>
          ) : activity.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Your account activity will appear here as you use the product."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {activity.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{log.action}</p>
                    <p className="text-xs text-slate-500">{formatDate(log.created_at)}</p>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
