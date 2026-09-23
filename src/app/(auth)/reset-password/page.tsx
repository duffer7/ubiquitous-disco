import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getMessages } from "@/i18n/server";

const t = getMessages();

export const metadata: Metadata = { title: t.metadata.resetPassword };

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
        title={t.auth.resetLinkRequiredTitle}
        subtitle={t.auth.resetLinkRequiredSubtitle}
        footer={
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            {t.auth.backToSignIn}
          </Link>
        }
      >
        <p className="text-sm text-slate-600">
          {t.auth.resetLinkRequiredBodyStart}{" "}
          <Link href="/forgot-password" className="font-medium text-brand-600 hover:underline">
            {t.auth.requestNewLink}
          </Link>
          {t.auth.resetLinkRequiredBodyEnd}
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t.auth.resetTitle}
      subtitle={t.auth.resetSubtitle}
      footer={
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          {t.auth.backToSignIn}
        </Link>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
