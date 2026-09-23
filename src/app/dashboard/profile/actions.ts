"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { updateProfile } from "@/lib/db/users";
import { logActivity } from "@/lib/db/users";
import { getMessages } from "@/i18n/server";
import type { ActionState } from "@/lib/form-state";
import { toFieldErrors } from "@/lib/form-state";
import { updateProfileSchema } from "@/lib/validation/profile";

/**
 * Update the signed-in user's own profile.
 *
 * Only self-editable fields are accepted (never `role` or `email`, which are
 * admin-controlled). Validation is shared with the client form.
 */
export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireUser("/dashboard/profile");
  const t = getMessages();

  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    company: formData.get("company"),
    phone: formData.get("phone"),
    avatarUrl: formData.get("avatarUrl"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  }

  const updated = await updateProfile(profile.id, {
    full_name: parsed.data.fullName,
    company: parsed.data.company ?? null,
    phone: parsed.data.phone ?? null,
    avatar_url: parsed.data.avatarUrl ?? null,
  });

  if (!updated) {
    return { status: "error", message: t.action.profileUpdateFailed };
  }

  await logActivity(profile.id, "profile.updated");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return { status: "success", message: t.action.profileUpdated };
}
