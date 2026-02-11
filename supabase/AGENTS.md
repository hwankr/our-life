<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# supabase

## Purpose
Database schema definitions and migration files for the Supabase PostgreSQL backend. Contains the initial schema SQL and incremental migration scripts.

## Key Files

| File | Description |
|------|-------------|
| `schema.sql` | Complete database schema with 5 tables, RLS policies, indexes, and triggers |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `migrations/` | Incremental SQL migration files (see `migrations/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `schema.sql` is the canonical full schema - run in Supabase SQL Editor for fresh setup
- Migrations in `migrations/` are incremental changes applied after initial schema
- All tables use Row Level Security (RLS) - every table has explicit policies
- After any schema change, update `docs/SCHEMA.md` to match

### Database Tables
| Table | Purpose |
|-------|---------|
| `users` | User profiles linked to Supabase Auth |
| `periods` | Time periods (e.g., "2026 H1") with participant arrays |
| `goals` | Per-user goals within a period (ROUTINE/LIMIT/OBJECTIVE) |
| `daily_logs` | Daily diary entries per user per period |
| `goal_logs` | Goal check-in records linked to daily logs |

### Key Patterns
- `participant_ids UUID[]` on periods for multi-user access control
- RLS policies check `auth.uid() = ANY(participant_ids)` for period-scoped access
- Admin client (service role) used server-side to bypass RLS for mutations
- Trigger `update_goal_current_count()` auto-updates `goals.current_count` and `study_day_count`
- `(user_id, period_id, log_date)` unique constraint on daily_logs

## Dependencies

### External
- Supabase PostgreSQL with Auth module
- Row Level Security for access control

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
