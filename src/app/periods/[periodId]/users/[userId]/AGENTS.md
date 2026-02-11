<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# [userId]

## Purpose
User goal detail page at `/periods/[periodId]/users/[userId]`. Shows a specific user's profile, all their goals with progress, and recent daily log entries.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | User detail - profile card, goal grid (GoalCard), recent logs list, today's log CTA |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `logs/` | Container for date-scoped daily log routes |

## For AI Agents

### Working In This Directory
- Server Component fetching period, user, goals, and recent logs
- `isOwnPage` check: only the page owner sees "add goal" button and "today's log" CTA
- Goals displayed as responsive grid using `GoalCard` component
- Recent logs (last 5) displayed as clickable cards linking to log detail
- `AddGoalDialog` allows creating new goals (own page only)
- `RefreshButton` for manual data refresh

### Data Flow
```
period (by periodId)
targetUser (by userId)
goals (by periodId + userId, ordered by created_at)
recentLogs (last 5 daily_logs, ordered by log_date desc)
todayLog (check if today's log exists)
```

### Authorization
- Any period participant can VIEW any other participant's goals
- Only the page owner can ADD goals and WRITE daily logs

## Dependencies

### Internal
- `@/lib/supabase/server` - Data fetching
- `@/lib/date-utils` - Today string, Korean date format
- `@/types` - Goal, DailyLog
- `@/components/goal-card` - Goal display
- `@/components/add-goal-dialog` - Goal creation
- `@/components/refresh-button` - Manual refresh
- `@/components/ui/*` - Card, Avatar, Button, motion-layout

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
