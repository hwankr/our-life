<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# src

## Purpose
Application source code for the OurLife Next.js app. Contains all React components, pages, server actions, utility libraries, type definitions, and Supabase integration.

## Key Files

| File | Description |
|------|-------------|
| `proxy.ts` | Next.js middleware proxy - routes all requests through Supabase session updater |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router pages, layouts, and server actions (see `app/AGENTS.md`) |
| `components/` | Reusable React components - UI primitives and feature components (see `components/AGENTS.md`) |
| `lib/` | Utility functions and Supabase client configuration (see `lib/AGENTS.md`) |
| `types/` | Centralized TypeScript type definitions (see `types/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Use `@/` import alias which maps to `src/`
- All components are TypeScript (`.tsx` / `.ts`)
- Server Components are the default; add `'use client'` directive only when client interactivity is needed
- Korean language for all user-facing strings

### Testing Requirements
- `npm run build` must pass (TypeScript + Next.js compilation)
- `npm run lint` must pass (ESLint)

### Common Patterns
- Feature components in `components/` subdirectories (goals/, periods/)
- UI primitives in `components/ui/` (shadcn/ui)
- Server actions in `app/actions/`
- Database access via `lib/supabase/` clients
- Shared types from `types/index.ts`

## Dependencies

### Internal
- `types/` provides all TypeScript interfaces
- `lib/` provides Supabase clients and utilities
- `components/` consumed by `app/` pages

### External
- React 19, Next.js 16, TypeScript 5
- Tailwind CSS 4 for styling
- shadcn/ui component library

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
