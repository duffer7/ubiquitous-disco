# Orbit — Brand Book

> **Control your product universe.**

## 1. Positioning

Orbit is not an admin dashboard — it is a **Customer Operations Center for
early-stage SaaS teams**. The core metaphor: users, data and activity *orbit* a
central product core, which the operator monitors and steers.

**Elevator pitch.** Orbit is a modern customer operations platform that helps
SaaS teams manage users, monitor activity, and keep customer data organized
through a clean, intuitive dashboard.

**Investor line.** Orbit provides a centralized customer operations hub designed
for growing SaaS businesses. The platform combines user management, activity
monitoring, account administration and operational insights into a single
production-ready workspace.

## 2. Naming & taglines

| Field        | Value                                  |
| ------------ | -------------------------------------- |
| Product name | **Orbit**                              |
| Primary tagline | Control your product universe.      |
| Alternatives | Every customer in your orbit · A smarter way to manage users · Your product. One command center. |

## 3. Logo

A single **O** (Orbit) formed by a central node and two elliptical orbits, with
an orbiting node on the outer ring. Symbolizes users, data and operations in
motion around the product core. Minimal, Vercel-grade.

Assets:
- React component: `src/components/ui/logo.tsx` (`<OrbitLogo />`, `<OrbitWordmark />`)
- Static asset: `public/logo.svg`

## 4. Colour system

### Dark surface (primary)

| Token           | Hex       | Usage              |
| --------------- | --------- | ------------------ |
| `surface`       | `#09090B` | App background     |
| `surface-card`  | `#18181B` | Cards / panels     |
| `surface-muted` | `#27272A` | Borders / dividers |

### Brand

| Token          | Hex       | Usage                |
| -------------- | --------- | -------------------- |
| `brand-500`    | `#6366F1` | Primary (indigo)     |
| `accent-500`   | `#8B5CF6` | Accent (violet)      |
| Success        | `#22C55E` | Positive states      |
| Warning        | `#F59E0B` | Caution states       |
| Danger         | `#EF4444` | Destructive states   |
| Text           | `#FAFAFA` | Primary text         |
| Muted text     | `#A1A1AA` | Secondary text       |

### Brand gradient

`#6366F1 → #8B5CF6 → #EC4899` — used for headline accents (`.text-orbit-gradient`),
the hero glow (`.bg-orbit-glow`), and the logo.

## 5. Product vocabulary

Orbit uses its own lexicon instead of generic CRUD terms:

| Generic          | Orbit               |
| ---------------- | ------------------- |
| Dashboard        | **Command Center**  |
| Analytics        | **Orbit Insights**  |
| Users            | **Members**         |
| Activity         | **Activity Signals**|
| Statistics       | **Pulse Metrics**   |
| Admin panel      | **Operations Hub**  |
| User health      | **Pulse Score**     |
| Notifications    | **Alerts**          |
| Reports          | **Mission Reports** |
| Admin (role)     | **Operator**        |
| User (role)      | **Member**          |

## 6. Signature feature — Orbit Pulse™

A health score (0–100) computed from recent activity volume, recency of
sign-in and profile completeness. Surfaced as the **Product Pulse** card on the
Command Center and per-account in the Customer Directory.

## 7. Tone of voice

- Confident, precise, calm — enterprise software, not hype.
- Space metaphor used sparingly: "universe", "orbit", "signals", "sectors".
- Empty states are warm and directional, never dead ends.

## 8. Voice examples (empty states)

- **No users:** *Your universe is empty. Add your first customer and begin
  building your product ecosystem.*
- **No activity:** *Once customers start interacting with your platform, events
  and insights will appear here.*
- **No search results:** *Nothing found in this sector. Try adjusting your
  filters or search criteria.*

See `src/i18n/locales/en.ts` for the complete, canonical copy catalogue.
