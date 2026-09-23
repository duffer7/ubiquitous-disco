import type { Metadata } from "next";

import { ProfileForm } from "@/components/dashboard/profile-form";
import { RoleBadge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { getMessages } from "@/i18n/server";

const t = getMessages();

export const metadata: Metadata = { title: t.metadata.profile, description: t.metadata.descriptionProfile };

/**
 * Profile page. Read-only account facts are shown alongside an editable form
 * for the self-service fields (name, company, phone, avatar).
 */
export default async function ProfilePage() {
  const profile = await requireUser("/dashboard/profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">{t.dashboard.profileTitle}</h1>
        <p className="mt-1 text-sm text-zinc-400">{t.dashboard.profileSubtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Editable details */}
        <section className="card lg:col-span-2">
          <div className="border-b border-surface-muted px-6 py-4">
            <h2 className="text-sm font-semibold text-zinc-50">
              {t.dashboard.personalInformation}
            </h2>
            <p className="text-xs text-zinc-400">{t.dashboard.personalInformationSubtitle}</p>
          </div>
          <div className="p-6">
            <ProfileForm profile={profile} />
          </div>
        </section>

        {/* Read-only account facts */}
        <section className="card h-fit">
          <div className="border-b border-surface-muted px-6 py-4">
            <h2 className="text-sm font-semibold text-zinc-50">{t.dashboard.accountSection}</h2>
            <p className="text-xs text-zinc-400">{t.dashboard.accountSectionSubtitle}</p>
          </div>
          <dl className="divide-y divide-surface-muted">
            <AccountRow label={t.dashboard.accountEmail} value={profile.email} />
            <AccountRow label={t.dashboard.accountRole} value={<RoleBadge role={profile.role} />} />
            <AccountRow
              label={t.dashboard.accountMemberSince}
              value={formatDate(profile.created_at)}
            />
            <AccountRow
              label={t.dashboard.accountLastUpdated}
              value={formatDate(profile.updated_at)}
            />
          </dl>
        </section>
      </div>
    </div>
  );
}

function AccountRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-6 py-3">
      <dt className="text-sm text-zinc-400">{label}</dt>
      <dd className="text-right text-sm font-medium text-zinc-50">{value}</dd>
    </div>
  );
}
