import { AppHeader } from "@/components/dashboard/app-header";
import { requireAdmin } from "@/lib/auth";

/**
 * Admin layout. `requireAdmin` performs the authoritative role check on the
 * server and redirects non-admins to /dashboard.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader profile={profile} />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
