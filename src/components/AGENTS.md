<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# components

## Purpose
Reusable React components organized by feature domain and UI primitives. Contains feature components (goals, periods), shared app components, and shadcn/ui base components.

## Key Files

| File | Description |
|------|-------------|
| `add-goal-dialog.tsx` | Dialog for creating new goals (ROUTINE/LIMIT/OBJECTIVE) with cycle selection |
| `daily-log-form.tsx` | Form for daily diary entry and goal check-ins |
| `goal-card.tsx` | Goal display card with type-specific progress visualization |
| `logout-button.tsx` | Logout button triggering Supabase sign-out |
| `refresh-button.tsx` | Manual page refresh button |
| `theme-provider.tsx` | next-themes ThemeProvider wrapper |
| `theme-toggle.tsx` | Dark/light mode toggle button |
| `user-menu.tsx` | User avatar dropdown with profile and logout |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `goals/` | Goal-specific components (edit dialog) (see `goals/AGENTS.md`) |
| `periods/` | Period-specific components (cards, calendar, modals) (see `periods/AGENTS.md`) |
| `ui/` | shadcn/ui base components (see `ui/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Feature components use `'use client'` when they need interactivity
- Components import types from `@/types`
- Server actions called from client components via `@/app/actions/*`
- Styling uses Tailwind CSS classes; dark mode via `dark:` variant

### Testing Requirements
- `npm run build` must pass after any component changes
- Verify UI renders correctly in both light and dark themes

### Common Patterns
- Client components with `'use client'` directive for forms and interactive elements
- `toast()` from sonner for success/error notifications
- `useRouter().refresh()` after server action calls for data revalidation
- Goal type conditional rendering (ROUTINE/LIMIT/OBJECTIVE display differently)
- Korean text for all labels and messages

## Dependencies

### Internal
- `@/types` - Goal, Period, DailyLog, GoalLog types
- `@/app/actions/*` - Server actions for mutations
- `@/lib/goal-calculator` - Progress calculation functions
- `@/lib/date-utils` - Date formatting utilities
- `@/components/ui/*` - Base UI primitives

### External
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `framer-motion` - Animations

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
