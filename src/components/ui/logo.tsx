import { cn } from "@/lib/utils";

/**
 * Orbit brandmark — a central node (the product core) with two elliptical
 * orbits (users · data · operations) rotating around it. Minimal, Vercel-grade.
 *
 * Renders in currentColor; wrap with a sized container and a text color, e.g.
 * `<span className="h-8 w-8 text-brand-500"><OrbitLogo /></span>`.
 */
export function OrbitLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Orbit"
      className={cn("h-full w-full", className)}
    >
      {/* Central core */}
      <circle cx="16" cy="16" r="3.25" fill="currentColor" />
      {/* Inner orbit */}
      <ellipse
        cx="16"
        cy="16"
        rx="8"
        ry="8"
        transform="rotate(-30 16 16)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.9"
      />
      {/* Outer orbit */}
      <ellipse
        cx="16"
        cy="16"
        rx="13"
        ry="7"
        transform="rotate(-30 16 16)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
      {/* Orbiting node on the outer ring */}
      <circle cx="27.3" cy="8.4" r="1.75" fill="currentColor" />
    </svg>
  );
}

/**
 * Full lockup: the Orbit mark plus the wordmark. `markClassName` sizes the
 * glyph; the wordmark inherits the surrounding text styles.
 */
export function OrbitWordmark({
  className,
  markClassName = "h-8 w-8 text-brand-500",
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <span className={cn("grid place-items-center", markClassName)}>
        <OrbitLogo />
      </span>
      <span className="tracking-tight text-zinc-50">Orbit</span>
    </span>
  );
}
