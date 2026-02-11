<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# [date]

## Purpose
Daily log page at `/periods/[periodId]/users/[userId]/logs/[date]`. Form for writing/editing a daily diary entry and checking in on goals for a specific date.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Daily log page - loads existing data and renders DailyLogForm |

## For AI Agents

### Working In This Directory
- Server Component that fetches period, goals, existing daily log, and existing goal logs
- **Authorization**: only the log owner (`authUser.id === userId`) can access; others are redirected
- Dynamic segment `[date]` is YYYY-MM-DD format
- Delegates all form logic to `DailyLogForm` client component
- Passes existing data as props for edit mode (pre-fills form)

### Data Flow
```
period (by periodId)
goals (user's goals for this period)
dailyLog (existing log for this date, if any)
goalLogs (existing goal check-ins for this daily log, if any)
  → All passed to DailyLogForm component
```

### Page Behavior
| Scenario | Behavior |
|----------|----------|
| No existing log | DailyLogForm in create mode |
| Existing log | DailyLogForm in edit mode with pre-filled data |
| Not the owner | Redirect to user detail page |
| Not authenticated | Redirect to home |

## Dependencies

### Internal
- `@/lib/supabase/server` - Data fetching
- `@/components/daily-log-form` - Form component (client-side)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
