<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# our-life

## Purpose
A Next.js web application ("OurLife") for tracking daily activities and goal achievement with a friend over defined time periods (e.g., 6 months). Users log daily diaries, set goals (ROUTINE/LIMIT/OBJECTIVE types), and monitor each other's progress. Built with Korean UI and Supabase backend.

## Tech Stack

| Technology | Version | Role |
|-----------|---------|------|
| Next.js | 16.x | App Router framework (React 19) |
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Supabase | 2.x | Auth (Google OAuth) + PostgreSQL database |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | - | UI component library (Radix primitives) |
| Framer Motion | 12.x | Animations |
| date-fns | 4.x | Date utilities |
| next-themes | 0.4.x | Dark mode support |

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Dependencies and scripts (`dev`, `build`, `start`, `lint`) |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `components.json` | shadcn/ui configuration |
| `.env.local` | Environment variables (Supabase URL, keys) |
| `.env.local.example` | Template for required environment variables |
| `eslint.config.mjs` | ESLint configuration |
| `postcss.config.mjs` | PostCSS with Tailwind plugin |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Application source code (see `src/AGENTS.md`) |
| `docs/` | Project documentation - STATUS, SCHEMA, ROUTES, DECISIONS, CHANGELOG (see `docs/AGENTS.md`) |
| `supabase/` | Database schema and migrations (see `supabase/AGENTS.md`) |
| `public/` | Static assets (SVG icons) |
| `.agent/` | AI agent rules (Cursor/Windsurf rules) |

## For AI Agents

### Documentation-First Protocol (SYSTEM INSTRUCTION)

The developer uses a vibe-coding workflow with heavy AI dependence. Documentation continuity matters more than raw coding ability.

**Before starting any task**, you MUST read:
1. `docs/STATUS.md` - Current stage + remaining features
2. `docs/SCHEMA.md` - Current Supabase tables/relations
3. `docs/ROUTES_UI.md` - Pages + UI requirements

WARNING: Do NOT propose code without reading these files.

**After completing work**, update docs accordingly:
- DB changed -> overwrite `docs/SCHEMA.md` to latest state
- Feature completed -> update checkboxes + next steps in `docs/STATUS.md`
- UI changed -> update `docs/ROUTES_UI.md` to match latest plan
- Important decision made -> append to `docs/DECISIONS.md`
- Always record work -> append today's entry to `docs/CHANGELOG.md`

### Working In This Directory
- Run `npm run dev` for development
- Run `npm run build` to verify production build
- All dates use KST (Asia/Seoul) timezone - see `src/lib/date-utils.ts`
- Korean language UI - all user-facing strings are in Korean
- Use `@/` path alias for imports from `src/`

### Testing Requirements
- Run `npm run build` to check for TypeScript errors
- Run `npm run lint` for ESLint checks
- Manually verify Supabase RLS policies when changing data access

### Common Patterns
- Server Components by default, `'use client'` only when needed
- Server Actions in `src/app/actions/` for mutations
- Admin Supabase client for operations requiring RLS bypass
- Goal types: ROUTINE (habit tracking), LIMIT (restriction tracking), OBJECTIVE (achievement tracking)
- Goal cycles: TOTAL (entire period), WEEKLY, MONTHLY

### Architecture

```
Authentication: Google OAuth via Supabase Auth
Data Access:   Supabase client (RLS) + Admin client (service role for mutations)
Routing:       Next.js App Router with dynamic segments
State:         Server-side data fetching, client-side forms with server actions
Styling:       Tailwind CSS + shadcn/ui components
```

## Dependencies

### External
- `@supabase/ssr` + `@supabase/supabase-js` - Database and auth
- `@radix-ui/*` - Accessible UI primitives (via shadcn/ui)
- `framer-motion` - Page transitions and animations
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `date-fns` - Date manipulation
- `next-themes` - Theme switching

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
