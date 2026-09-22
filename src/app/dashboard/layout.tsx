import { AppHeader } from "@/components/dashboard/app-header";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side guard: redirects unauthenticated visitors to /login.
  const profile = await requireUser("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader profile={profile} />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="border-t border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} SaaS Dashboard
      </footer>
    </div>
  );
}
