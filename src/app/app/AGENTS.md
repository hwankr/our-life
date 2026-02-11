<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# app

## Purpose
Main dashboard page at route `/app`. Displays list of user's periods with creation capability. Protected route requiring authentication.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Dashboard page - shows period cards grid, "new period" button, empty state |

## For AI Agents

### Working In This Directory
- Server Component that fetches periods for the authenticated user
- Queries periods where `participant_ids` contains current user ID
- Sorts: active periods first, then by creation date descending
- Uses `CreatePeriodModal` and `PeriodCard` components
- Redirects to `/auth/login` if not authenticated

### UI Structure
- Sticky header with logo, theme toggle, and user menu
- Period cards in responsive grid (1/2/3 columns)
- Empty state with CTA to create first period
- Framer Motion animations (FadeIn, StaggerContainer)

## Dependencies

### Internal
- `@/lib/supabase/server` - Data fetching
- `@/components/periods/CreatePeriodModal` - Period creation
- `@/components/periods/PeriodCard` - Period display
- `@/components/user-menu` - User dropdown
- `@/components/theme-toggle` - Theme switcher
- `@/components/ui/motion-layout` - Animations

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
