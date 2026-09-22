import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Admin" };

/**
 * Admin landing. The full admin panel (user list, search/filter, detail view,
 * editing, aggregate stats) is implemented in Stage 2. For Stage 1 this page
 * confirms authentication + role-based access and reserves the route.
 */
export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Admin</h1>
        <p className="mt-1 text-sm text-slate-500">
          Administrative area — accessible only to users with the admin role.
        </p>
      </div>

      <EmptyState
        title="Admin panel coming in Stage 2"
        description="User management, search & filtering, detailed user views and aggregate statistics will live here."
      />
    </div>
  );
}
