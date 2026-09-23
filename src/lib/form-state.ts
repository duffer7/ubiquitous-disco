/**
 * Shared types and constants for form Server Actions.
 *
 * This lives in a plain module (NOT a "use server" file) because Next.js
 * only allows `async` function exports from "use server" files. Client
 * components import `initialActionState` and `ActionState` from here.
 */

/**
 * Shape returned to forms via `useFormState`.
 * `fieldErrors` maps a form field name to a list of validation messages.
 */
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialActionState: ActionState = { status: "idle" };

/**
 * Convert a Zod error into the `fieldErrors` shape used by forms.
 * Field paths with more than one segment are joined (e.g. `["a","b"]` → `"a.b"`).
 */
export function toFieldErrors(error: {
  issues: { path: (string | number)[]; message: string }[];
}): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

