"use client";

import { useFormState } from "react-dom";

import { updateUserAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/form-state";
import { useMessages } from "@/i18n/provider";
import type { Profile } from "@/types/database.types";

/** Admin form to edit a user's core data (including email and role). */
export function UserEditForm({ user }: { user: Profile }) {
  const t = useMessages();
  const [state, formAction] = useFormState(updateUserAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="id" value={user.id} />

      {state.status === "success" && state.message && (
        <Alert variant="success">{state.message}</Alert>
      )}
      {state.status === "error" && state.message && <Alert variant="error">{state.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t.auth.fullNameLabel}
          name="fullName"
          defaultValue={user.full_name ?? ""}
          required
          error={state.fieldErrors?.fullName}
        />
        <Input
          label={t.auth.emailLabel}
          name="email"
          type="email"
          defaultValue={user.email}
          required
          error={state.fieldErrors?.email}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t.dashboard.companyLabel}
          name="company"
          defaultValue={user.company ?? ""}
          error={state.fieldErrors?.company}
        />
        <Input
          label={t.dashboard.phoneLabel}
          name="phone"
          type="tel"
          defaultValue={user.phone ?? ""}
          error={state.fieldErrors?.phone}
        />
      </div>

      <Input
        label={t.dashboard.avatarUrlLabel}
        name="avatarUrl"
        type="url"
        defaultValue={user.avatar_url ?? ""}
        placeholder="https://…"
        error={state.fieldErrors?.avatarUrl}
      />

      <div className="sm:w-48">
        <label htmlFor="role" className="label">
          {t.admin.roleLabel}
        </label>
        <select
          id="role"
          name="role"
          className="input"
          defaultValue={user.role}
          aria-invalid={Boolean(state.fieldErrors?.role)}
        >
          <option value="client">{t.admin.roleClientOption}</option>
          <option value="admin">{t.admin.roleAdminOption}</option>
        </select>
        {state.fieldErrors?.role?.map((message) => (
          <p key={message} role="alert" className="mt-1 text-xs text-red-600">
            {message}
          </p>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <SubmitButton className="w-auto px-5">{t.common.saveChanges}</SubmitButton>
      </div>
    </form>
  );
}
