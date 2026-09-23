"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { countAdmins, deleteUser, findUserById, setUserRole } from "@/lib/db/admin";
import { isEmailTaken, logActivity, updateProfile } from "@/lib/db/users";
import { getMessages } from "@/i18n/server";
import type { ActionState } from "@/lib/form-state";
import { toFieldErrors } from "@/lib/form-state";
import {
  adminUpdateUserSchema,
  updateUserRoleSchema,
  userIdSchema,
} from "@/lib/validation/profile";

/**
 * Admin user-management Server Actions.
 *
 * Every action re-checks the admin role on the server (`requireAdmin`) — the
 * middleware guard is a UX layer only, this is the authoritative check.
 * Mutations are validated with Zod and guarded against unsafe operations
 * (e.g. demoting the last administrator).
 */

// ---------------------------------------------------------------------------
// Update a user's core data
// ---------------------------------------------------------------------------
export async function updateUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin("/admin");
  const t = getMessages();

  const id = String(formData.get("id") ?? "");
  const idCheck = userIdSchema.safeParse(id);
  if (!idCheck.success) {
    return { status: "error", message: t.admin.invalidUserId };
  }

  const parsed = adminUpdateUserSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    company: formData.get("company"),
    phone: formData.get("phone"),
    avatarUrl: formData.get("avatarUrl"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  }

  const target = await findUserById(id);
  if (!target) {
    return { status: "error", message: t.admin.userNoLongerExists };
  }

  // Prevent taking away the last admin (lock-out protection).
  if (target.role === "admin" && parsed.data.role !== "admin") {
    const adminCount = await countAdmins();
    if (adminCount <= 1) {
      return {
        status: "error",
        fieldErrors: { role: [t.admin.cannotDemoteLastAdmin] },
      };
    }
  }

  // Email must stay unique (case-insensitive).
  if (parsed.data.email !== target.email && (await isEmailTaken(parsed.data.email, id))) {
    return {
      status: "error",
      fieldErrors: { email: [t.admin.emailInUse] },
    };
  }

  const updated = await updateProfile(id, {
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    company: parsed.data.company ?? null,
    phone: parsed.data.phone ?? null,
    avatar_url: parsed.data.avatarUrl ?? null,
    role: parsed.data.role,
  });

  if (!updated) {
    return { status: "error", message: t.admin.updateUserFailed };
  }

  await logActivity(admin.id, "admin.user_updated", { userId: id, role: parsed.data.role });
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);

  return { status: "success", message: t.admin.userUpdated };
}

// ---------------------------------------------------------------------------
// Change a user's role (quick action from the list)
// ---------------------------------------------------------------------------
export async function updateUserRoleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin("/admin");
  const t = getMessages();

  const id = String(formData.get("id") ?? "");
  if (!userIdSchema.safeParse(id).success) {
    return { status: "error", message: t.admin.invalidUserId };
  }

  const parsed = updateUserRoleSchema.safeParse({ role: formData.get("role") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  }

  const target = await findUserById(id);
  if (!target) {
    return { status: "error", message: t.admin.userNoLongerExists };
  }

  if (target.role === "admin" && parsed.data.role !== "admin") {
    const adminCount = await countAdmins();
    if (adminCount <= 1) {
      return {
        status: "error",
        fieldErrors: { role: [t.admin.cannotDemoteLastAdmin] },
      };
    }
  }

  await setUserRole(id, parsed.data.role);
  await logActivity(admin.id, "admin.user_role_changed", { userId: id, role: parsed.data.role });
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);

  return { status: "success", message: t.admin.roleUpdated(parsed.data.role) };
}

// ---------------------------------------------------------------------------
// Delete a user
// ---------------------------------------------------------------------------
export async function deleteUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin("/admin");
  const t = getMessages();

  const id = String(formData.get("id") ?? "");
  if (!userIdSchema.safeParse(id).success) {
    return { status: "error", message: t.admin.invalidUserId };
  }

  if (id === admin.id) {
    return { status: "error", message: t.admin.cannotDeleteSelf };
  }

  const target = await findUserById(id);
  if (!target) {
    return { status: "error", message: t.admin.userNoLongerExists };
  }

  if (target.role === "admin") {
    const adminCount = await countAdmins();
    if (adminCount <= 1) {
      return { status: "error", message: t.admin.cannotDeleteLastAdmin };
    }
  }

  await deleteUser(id);
  await logActivity(admin.id, "admin.user_deleted", { userId: id, email: target.email });
  revalidatePath("/admin");
  revalidatePath("/admin/users");

  return { status: "success", message: t.admin.userDeleted(target.email) };
}
