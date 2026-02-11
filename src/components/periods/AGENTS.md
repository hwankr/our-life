<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# periods

## Purpose
Period-specific UI components for displaying period cards, calendars, modals for creation/editing, and day detail views.

## Key Files

| File | Description |
|------|-------------|
| `CreatePeriodModal.tsx` | Modal dialog for creating a new period (title, dates, participant) |
| `DayDetailModal.tsx` | Modal showing daily log details for a selected calendar day |
| `EditPeriodDialog.tsx` | Dialog for editing period properties |
| `PeriodCalendar.tsx` | Calendar view showing daily log status across the period |
| `PeriodCard.tsx` | Card displaying period summary (title, dates, D-day, progress) |

## For AI Agents

### Working In This Directory
- All components are client components (`'use client'`)
- `PeriodCalendar.tsx` uses `react-day-picker` for calendar rendering
- `PeriodCard.tsx` displays on the dashboard, links to period detail
- Modals use shadcn/ui Dialog component
- Period creation requires selecting a friend (participant) by user lookup

### Common Patterns
- D-day calculation via `@/lib/date-utils`
- Period dates in YYYY-MM-DD format
- Cards use Framer Motion for hover effects
- Calendar highlights days with existing logs

## Dependencies

### Internal
- `@/types` - Period, DailyLog types
- `@/lib/date-utils` - Date formatting, D-day
- `@/lib/supabase/client` - Browser client for interactive queries
- `@/app/actions/period-actions` - Period mutations
- `@/components/ui/*` - Card, Dialog, Button, Calendar, Input

### External
- `react-day-picker` - Calendar component
- `date-fns` - Date arithmetic for calendar
- `lucide-react` - Icons

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
