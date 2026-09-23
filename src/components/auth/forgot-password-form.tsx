"use client";

import { useFormState } from "react-dom";

import { forgotPasswordAction } from "@/app/(auth)/actions";
import { initialActionState } from "@/lib/form-state";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useMessages } from "@/i18n/provider";

export function ForgotPasswordForm() {
  const t = useMessages();
  const [state, formAction] = useFormState(forgotPasswordAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "success" && <Alert variant="success">{state.message}</Alert>}
      {state.status === "error" && state.message && <Alert variant="error">{state.message}</Alert>}

      <Input
        label={t.auth.emailLabel}
        name="email"
        type="email"
        autoComplete="email"
        placeholder={t.auth.emailPlaceholder}
        required
        error={state.fieldErrors?.email}
      />

      <SubmitButton>{t.auth.sendResetLink}</SubmitButton>
    </form>
  );
}
