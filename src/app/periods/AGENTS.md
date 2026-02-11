<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# periods

## Purpose
Period-scoped routes for viewing period summaries, individual user goals, and daily logs. Uses nested dynamic segments for period, user, and date parameters.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Auth guard layout - redirects unauthenticated users to `/` |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[periodId]/` | Period detail and nested user/log routes (see `[periodId]/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `layout.tsx` provides auth protection for all nested routes
- Dynamic route segments: `[periodId]`, `[userId]`, `[date]`
- All pages are Server Components fetching from Supabase
- Period data accessed via `params.periodId`, user via `params.userId`, date via `params.date`

### Route Hierarchy
```
/periods/
  layout.tsx                              → Auth guard
  [periodId]/
    page.tsx                              → Period summary with user cards
    users/
      [userId]/
        page.tsx                          → User goal detail with calendar
        logs/
          [date]/
            page.tsx                      → Daily log form
```

## Dependencies

### Internal
- `@/lib/supabase/server` - Auth check and data fetching
- `@/components/periods/*` - Period-specific components
- `@/components/*` - Goal and log components

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
