import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getMessages } from "@/i18n/server";

const t = getMessages();

export const metadata: Metadata = { title: t.metadata.forgotPassword };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title={t.auth.forgotTitle}
      subtitle={t.auth.forgotSubtitle}
      footer={
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          {t.auth.backToSignIn}
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
