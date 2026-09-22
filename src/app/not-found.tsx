import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
    >
      <p className="text-sm font-medium text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-1 text-sm text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Go home
      </Link>
    </main>
  );
}
