import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectedFrom?: string; error?: string };
}) {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to access your dashboard."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {searchParams.error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {searchParams.error === "auth_callback_failed"
            ? "We couldn't verify that link. Please try signing in again."
            : searchParams.error}
        </p>
      )}
      <LoginForm redirectedFrom={searchParams.redirectedFrom} />
    </AuthCard>
  );
}
