/**
 * Minimal class-name joiner. Kept dependency-free (no clsx/tailwind-merge)
 * to avoid pulling extra packages in for a small helper.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format an ISO timestamp for display, falling back gracefully. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Return initials for an avatar fallback, e.g. "Ada Lovelace" -> "AL". */
export function initials(name: string | null | undefined, email?: string): string {
  const source = name?.trim() || email?.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}
