<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# actions

## Purpose
Next.js Server Actions for data mutations. All database write operations go through these functions, which handle authentication, authorization, and Supabase admin client usage.

## Key Files

| File | Description |
|------|-------------|
| `goal-actions.ts` | `addGoal()` and `deleteGoal()` - create/remove goals with RLS bypass |
| `period-actions.ts` | `deletePeriod()` - cascade delete period with all related data |

## For AI Agents

### Working In This Directory
- All files must start with `'use server'` directive
- Authentication check (`supabase.auth.getUser()`) required at start of every action
- Use admin client (`createAdminClient()`) for writes that need RLS bypass
- Call `revalidatePath()` after successful mutations to refresh page data
- Return `{ success: boolean; error?: string }` pattern for all actions

### Security Pattern
```
1. Create regular Supabase client
2. Verify user authentication
3. Check authorization (ownership/participation)
4. Use admin client for the actual mutation
5. Revalidate affected paths
```

### Common Patterns
- Authorization checks use regular client (respects RLS)
- Actual mutations use admin client (bypasses RLS)
- Error messages in Korean for user-facing errors
- Cascade deletions handled manually (goal_logs -> goals -> daily_logs -> period)

## Dependencies

### Internal
- `@/lib/supabase/server` - Regular Supabase client for auth checks
- `@/lib/supabase/admin` - Admin client for mutations
- `@/types` - GoalType, GoalCycle types

### External
- `next/cache` - `revalidatePath` for cache invalidation

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
