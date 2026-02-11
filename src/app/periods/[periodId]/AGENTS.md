<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# [periodId]

## Purpose
Period detail page and container for nested user/log routes. Dynamic segment `[periodId]` resolves to a specific period UUID.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Period summary - progress bar, calendar view, participant cards with goal previews |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `users/` | Container for user-scoped routes (`[userId]/` and deeper) |

## For AI Agents

### Working In This Directory
- Server Component fetching period, participants, goals, daily logs, and goal logs
- Calculates period progress based on elapsed days vs total days
- Groups goals by user for participant summary cards
- Displays `PeriodCalendar` with all participants' log data
- `EditPeriodDialog` in header for period modification
- Participant cards link to `/periods/[periodId]/users/[userId]`

### Data Flow
```
period (by periodId)
  ├── participants (users by participant_ids)
  ├── goals (all goals in period)
  ├── dailyLogs (all logs in period)
  └── goalLogs (all goal logs for those daily logs)
```

### UI Sections
1. Header with back link, period title, D-day badge, edit dialog
2. Period progress bar (elapsed days / total days)
3. PeriodCalendar component
4. Participant cards grid (avatar, goal count, top 3 goals, progress)

## Dependencies

### Internal
- `@/lib/supabase/server` - Data fetching
- `@/lib/date-utils` - D-day, date formatting
- `@/types` - User, Period, Goal
- `@/components/periods/EditPeriodDialog` - Period editing
- `@/components/periods/PeriodCalendar` - Calendar view
- `@/components/ui/*` - Card, Avatar, Progress, motion-layout

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
