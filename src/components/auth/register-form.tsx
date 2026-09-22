"use client";

import { useFormState } from "react-dom";

import { signUpAction } from "@/app/(auth)/actions";
import { initialActionState } from "@/lib/form-state";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const [state, formAction] = useFormState(signUpAction, initialActionState);

  if (state.status === "success") {
    return (
      <Alert variant="success">
        {state.message ?? "Account created."} You can now{" "}
        <a href="/login" className="font-medium underline">
          sign in
        </a>
        .
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" && state.message && <Alert variant="error">{state.message}</Alert>}

      <Input
        label="Full name"
        name="fullName"
        type="text"
        autoComplete="name"
        placeholder="Ada Lovelace"
        required
        error={state.fieldErrors?.fullName}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        error={state.fieldErrors?.email}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        required
        hint="At least 8 characters, including a letter and a number."
        error={state.fieldErrors?.password}
      />

      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}

