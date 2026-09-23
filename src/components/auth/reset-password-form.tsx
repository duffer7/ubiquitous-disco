"use client";

import { useFormState } from "react-dom";

import { resetPasswordAction } from "@/app/(auth)/actions";
import { initialActionState } from "@/lib/form-state";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useMessages } from "@/i18n/provider";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useMessages();
  const [state, formAction] = useFormState(resetPasswordAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" && state.message && <Alert variant="error">{state.message}</Alert>}

      <input type="hidden" name="token" value={token} />

      <Input
        label={t.auth.newPasswordLabel}
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder={t.auth.passwordPlaceholder}
        required
        hint={t.auth.passwordHint}
        error={state.fieldErrors?.password}
      />

      <Input
        label={t.auth.confirmPasswordLabel}
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder={t.auth.passwordPlaceholder}
        required
        error={state.fieldErrors?.confirmPassword}
      />

      <SubmitButton>{t.auth.updatePassword}</SubmitButton>
    </form>
  );
}
