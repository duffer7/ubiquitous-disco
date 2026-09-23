import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getMessages } from "@/i18n/server";


const t = getMessages();

export const metadata: Metadata = { title: t.metadata.signIn, description: t.metadata.descriptionSignIn };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectedFrom?: string; error?: string };
}) {
  return (
    <AuthCard


      title={t.auth.welcomeBackTitle}
      subtitle={t.auth.welcomeBackSubtitle}
      footer={
        <>

          {t.auth.noAccount}{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">

            {t.auth.createOne}
          </Link>
        </>
      }
    >
      {searchParams.error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {searchParams.error === "auth_callback_failed"

            ? t.auth.authCallbackFailed
            : searchParams.error}
        </p>
      )}
      <LoginForm redirectedFrom={searchParams.redirectedFrom} />
    </AuthCard>
  );
}
