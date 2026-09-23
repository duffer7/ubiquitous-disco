import { z } from "zod";

import { emailSchema } from "@/lib/validation/auth";
import { getMessages } from "@/i18n/server";

const v = getMessages().validation;

const optionalText = (max: number, message: string) =>
  z
    .string()
    .max(max, message)
    .transform((v) => v.trim())
    .transform((v) => (v.length === 0 ? null : v))
    .nullable()
    .optional();

const phoneSchema = z
  .string()
  .max(32, v.phoneMax)
  .transform((v) => v.trim())
  .refine((v) => v.length === 0 || /^[+()\-\s\d.]+$/.test(v), v.phoneInvalid)
  .transform((v) => (v.length === 0 ? null : v))
  .nullable()
  .optional();

const avatarUrlSchema = z
  .string()
  .max(500, v.urlMax)
  .transform((v) => v.trim())
  .refine((v) => v.length === 0 || /^https?:\/\//i.test(v), v.urlInvalid)
  .transform((v) => (v.length === 0 ? null : v))
  .nullable()
  .optional();

/** Fields a client can edit on their own profile. */
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, v.fullNameMin)
    .max(120, v.fullNameMax)
    .transform((v) => v.trim()),
  company: optionalText(120, v.companyMax),
  phone: phoneSchema,
  avatarUrl: avatarUrlSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Fields an admin can additionally edit on any user. */
export const adminUpdateUserSchema = updateProfileSchema.extend({
  email: emailSchema,
  role: z.enum(["client", "admin"], { errorMap: () => ({ message: v.roleInvalid }) }),
});

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

/** Role changes / deletion guards. */
export const updateUserRoleSchema = z.object({
  role: z.enum(["client", "admin"], { errorMap: () => ({ message: v.roleInvalid }) }),
});

export const userIdSchema = z.string().uuid(v.userIdInvalid);
