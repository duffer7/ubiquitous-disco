import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { getMessages } from "@/i18n/server";

const t = getMessages();

export const metadata: Metadata = { title: t.metadata.register };

export default function RegisterPage() {
  return (
    <AuthCard
      title={t.auth.createAccountTitle}
      subtitle={t.auth.createAccountSubtitle}
      footer={
        <>
          {t.auth.hasAccount}{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            {t.auth.signInLink}
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
