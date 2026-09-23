"use client";

import { useFormState } from "react-dom";

import Link from "next/link";

import { signInAction } from "@/app/(auth)/actions";
import { initialActionState } from "@/lib/form-state";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useMessages } from "@/i18n/provider";

export function LoginForm({ redirectedFrom }: { redirectedFrom?: string }) {
  const t = useMessages();
  const [state, formAction] = useFormState(signInAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {redirectedFrom && (
        <Alert variant="info">{t.auth.pleaseSignIn}</Alert>
      )}

      {state.status === "error" && state.message && (
        <Alert variant="error">{state.message}</Alert>
      )}

      <input type="hidden" name="redirectedFrom" value={redirectedFrom ?? "/dashboard"} />

      <Input
        label={t.auth.emailLabel}
        name="email"
        type="email"
        autoComplete="email"
        placeholder={t.auth.emailPlaceholder}
        required
        error={state.fieldErrors?.email}
      />

      <div>
        <Input
          label={t.auth.passwordLabel}
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={t.auth.passwordPlaceholder}
          required
          error={state.fieldErrors?.password}
        />
        <div className="mt-2 text-right">
          <Link href="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline">
            {t.auth.forgotPassword}
          </Link>
        </div>
      </div>

      <SubmitButton>{t.auth.signInButton}</SubmitButton>
    </form>
  );
}
