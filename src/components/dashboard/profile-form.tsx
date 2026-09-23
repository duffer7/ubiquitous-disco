"use client";

import { useFormState } from "react-dom";

import { updateProfileAction } from "@/app/dashboard/profile/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/form-state";
import { useMessages } from "@/i18n/provider";
import type { Profile } from "@/types/database.types";

/** Editable profile form for the signed-in client. */
export function ProfileForm({ profile }: { profile: Profile }) {
  const t = useMessages();
  const [state, formAction] = useFormState(updateProfileAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "success" && state.message && (
        <Alert variant="success">{state.message}</Alert>
      )}
      {state.status === "error" && state.message && <Alert variant="error">{state.message}</Alert>}

      <Input
        label={t.auth.fullNameLabel}
        name="fullName"
        defaultValue={profile.full_name ?? ""}
        autoComplete="name"
        required
        error={state.fieldErrors?.fullName}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t.dashboard.companyLabel}
          name="company"
          defaultValue={profile.company ?? ""}
          autoComplete="organization"
          error={state.fieldErrors?.company}
        />
        <Input
          label={t.dashboard.phoneLabel}
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          autoComplete="tel"
          error={state.fieldErrors?.phone}
        />
      </div>

      <Input
        label={t.dashboard.avatarUrlLabel}
        name="avatarUrl"
        type="url"
        defaultValue={profile.avatar_url ?? ""}
        placeholder="https://…"
        hint={t.dashboard.avatarUrlHint}
        error={state.fieldErrors?.avatarUrl}
      />

      <div className="flex justify-end pt-2">
        <SubmitButton className="w-auto px-5">{t.common.saveChanges}</SubmitButton>
      </div>
    </form>
  );
}

