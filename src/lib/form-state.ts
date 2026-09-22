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
