import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Set a new password" };

/**
 * Reached via the password-recovery link, which contains a single-use token:
 *   /reset-password?token=<token>
 * The token is passed to the form and validated server-side when the password
 * is submitted.
 */
export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";

  if (!token) {
    return (
      <AuthCard
        title="Reset link required"
        subtitle="This page needs a valid reset link."
        footer={
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Back to sign in
          </Link>
        }
      >
        <p className="text-sm text-slate-600">
          Open the reset link from your email, or{" "}
          <Link href="/forgot-password" className="font-medium text-brand-600 hover:underline">
            request a new one
          </Link>
          .
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
      footer={
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
