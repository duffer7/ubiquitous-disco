import "server-only";

import { query } from "@/lib/db";
import type { ActivityLog } from "@/types/database.types";

/** Data-access for the activity log. */
export async function getRecentActivity(
  userId: string,
  limit = 10,
): Promise<ActivityLog[]> {
  return query<ActivityLog>(
    `select id, user_id, action, metadata, host(ip_address) as ip_address, created_at
     from activity_logs
     where user_id = $1
     order by created_at desc
     limit $2`,
    [userId, limit],
  );
}
