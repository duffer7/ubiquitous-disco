import type { Metadata } from "next";

import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile" };

/**
 * Read-only profile view for Stage 1. Editing is introduced on the client
 * dashboard in Stage 2.
 */
export default async function ProfilePage() {
  const profile = await requireUser("/dashboard/profile");

  const rows: Array<{ label: string; value: string }> = [
    { label: "Full name", value: profile.full_name || "—" },
    { label: "Email", value: profile.email },
    { label: "Company", value: profile.company || "—" },
    { label: "Phone", value: profile.phone || "—" },
    { label: "Role", value: profile.role },
    { label: "Member since", value: formatDate(profile.created_at) },
    { label: "Last updated", value: formatDate(profile.updated_at) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Your account information.</p>
      </div>

      <div className="card divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center">
            <dt className="w-48 text-sm text-slate-500">{row.label}</dt>
            <dd className="text-sm font-medium capitalize text-slate-900">{row.value}</dd>
          </div>
        ))}
      </div>
    </div>
  );
}
