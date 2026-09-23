import { formatDate, formatRelative, humanizeAction } from "@/lib/utils";
import { getMessages } from "@/i18n/server";
import type { ActivityLog } from "@/types/database.types";

/** Renders a list of activity log entries (presentational, server-safe). */
export function ActivityList({ items }: { items: ActivityLog[] }) {
  const t = getMessages();

  return (
    <ol className="relative space-y-6 border-l border-slate-200 pl-6">
      {items.map((log) => (
        <li key={log.id} className="relative">
          <span
            aria-hidden
            className="absolute -left-[1.9rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-500"
          />
          <p className="text-sm font-medium text-slate-800">
            {humanizeAction(log.action, t.activityActions)}
          </p>
          <p className="text-xs text-slate-500">
            <time dateTime={log.created_at} title={formatDate(log.created_at)}>
              {formatRelative(log.created_at)}
            </time>
            {log.ip_address && (
              <>
                {" · "}
                <span className="font-mono text-slate-400">{log.ip_address}</span>
              </>
            )}
          </p>
        </li>
      ))}
    </ol>
  );
}
