import Link from "next/link";

/**
 * Layout for the (auth) route group. Redirects for already-authenticated
 * users are handled in middleware.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
      <footer className="px-4 py-6 text-center text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600">
          SaaS Dashboard
        </Link>
      </footer>
    </div>
  );
}
