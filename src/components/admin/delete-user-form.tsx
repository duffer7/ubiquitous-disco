"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";

import { deleteUserAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { initialActionState } from "@/lib/form-state";
import { useMessages } from "@/i18n/provider";

/**
 * Danger-zone control to delete a user. Requires an explicit confirmation
 * step (type-to-confirm is intentionally avoided; a checkbox is enough for a
 * destructive admin action), then redirects back to the directory.
 */
export function DeleteUserForm({ userId, email }: { userId: string; email: string }) {
  const t = useMessages();
  const router = useRouter();
  const [state, formAction] = useFormState(deleteUserAction, initialActionState);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      router.push("/admin/users" as Route);
    }
  }, [state.status, router]);

  return (
    <div className="space-y-3">
      {state.status === "error" && state.message && <Alert variant="error">{state.message}</Alert>}

      {!confirming ? (
        <button type="button" className="btn-danger" onClick={() => setConfirming(true)}>
          {t.admin.deleteUser}
        </button>
      ) : (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={userId} />
          <p className="text-sm text-zinc-300">
            {t.admin.deleteConfirmPrefix} <span className="font-medium">{email}</span>{" "}
            {t.admin.deleteConfirmSuffix}
          </p>
          <div className="flex gap-2">
            <SubmitButton variant="danger" className="w-auto px-5">
              {t.admin.yesDelete}
            </SubmitButton>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setConfirming(false)}
            >
              {t.common.cancel}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

