"use client";

import { useFormState } from "react-dom";

import { signUpAction } from "@/app/(auth)/actions";
import { initialActionState } from "@/lib/form-state";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useMessages } from "@/i18n/provider";

export function RegisterForm() {
  const t = useMessages();
  const [state, formAction] = useFormState(signUpAction, initialActionState);

  if (state.status === "success") {
    return (
      <Alert variant="success">
        {state.message ?? t.auth.accountCreated} {t.auth.canNowSignInPrefix}{" "}
        <a href="/login" className="font-medium underline">
          {t.auth.signInLink}
        </a>
        {t.auth.canNowSignInSuffix}
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" && state.message && <Alert variant="error">{state.message}</Alert>}

      <Input
        label={t.auth.fullNameLabel}
        name="fullName"
        type="text"
        autoComplete="name"
        placeholder={t.auth.fullNamePlaceholder}
        required
        error={state.fieldErrors?.fullName}
      />

      <Input
        label={t.auth.emailLabel}
        name="email"
        type="email"
        autoComplete="email"
        placeholder={t.auth.emailPlaceholder}
        required
        error={state.fieldErrors?.email}
      />

      <Input
        label={t.auth.passwordLabel}
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder={t.auth.passwordPlaceholder}
        required
        hint={t.auth.passwordHint}
        error={state.fieldErrors?.password}
      />

      <SubmitButton>{t.auth.createAccountButton}</SubmitButton>
    </form>
  );
}

