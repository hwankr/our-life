<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# lib

## Purpose
Utility libraries and Supabase client configuration. Contains date handling (KST-aware), goal progress calculation engine, general utilities, and all Supabase client variants.

## Key Files

| File | Description |
|------|-------------|
| `date-utils.ts` | KST timezone-aware date formatting, D-day calculation, month/date ranges |
| `goal-calculator.ts` | Goal progress calculation for all 3 types (ROUTINE/LIMIT/OBJECTIVE) with cycle support (TOTAL/WEEKLY/MONTHLY) |
| `utils.ts` | General utility - `cn()` for Tailwind class merging (clsx + tailwind-merge) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `supabase/` | Supabase client configurations (browser, server, admin, middleware) (see `supabase/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `date-utils.ts` uses `Asia/Seoul` timezone for ALL date operations - never use raw `new Date()` for display
- `goal-calculator.ts` is the core business logic - handles weekly/monthly cycle calculations
- Week calculations use Sunday as start of week (not Monday)
- `parseDateOnly()` creates UTC dates from YYYY-MM-DD strings to avoid timezone shifts

### Key Functions

#### date-utils.ts
| Function | Purpose |
|----------|---------|
| `getTodayString()` | Today in KST as YYYY-MM-DD |
| `formatDate(date)` | Date to YYYY-MM-DD in KST |
| `formatDateKorean(str)` | Korean formatted date (e.g., "2026년 2월 7일") |
| `getDDay(targetDate)` | D-day calculation from target date |
| `getMonthsBetween(start, end)` | List of {year, month} between two dates |

#### goal-calculator.ts
| Function | Purpose |
|----------|---------|
| `calculateGoalProgress(goal, period, logs, dateMap)` | Unified progress calculator dispatching by goal type |
| `calculateRoutineProgress(goal, logs, dateMap)` | ROUTINE: count-based progress with cycle support |
| `calculateLimitProgress(goal, period, logs, dateMap)` | LIMIT: success rate across weeks/months |
| `calculateObjectiveProgress(goal, logs)` | OBJECTIVE: study log count and achievement |
| `getWeekKey(dateStr)` | Map date to Sunday-start week key |
| `getMonthKey(dateStr)` | Map date to YYYY-MM month key |

### Testing Requirements
- Date functions must be tested with KST edge cases (midnight boundary)
- Goal calculator must handle all 3 types x 3 cycles = 9 combinations

## Dependencies

### Internal
- `@/types` - Goal, GoalLog, GoalProgress, Period types

### External
- `clsx` + `tailwind-merge` - Class name utilities
- `date-fns` - Available but custom KST functions preferred

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
