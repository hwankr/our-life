<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# migrations

## Purpose
Incremental SQL migration files applied after the initial `schema.sql` setup. Each file adds or modifies database columns/constraints.

## Key Files

| File | Description |
|------|-------------|
| `add_goal_cycle.sql` | Adds `cycle` and `limit_value` columns to goals table |
| `add_objective_study_fields.sql` | Adds `study_target` and `study_unit` columns for OBJECTIVE goals |
| `add_objective_study_day_count.sql` | Adds `study_day_count` column and updates trigger for day counting |
| `allow_goal_decimal_values.sql` | Changes `target_value`/`achieved_value` to NUMERIC for decimal support |

## For AI Agents

### Working In This Directory
- Migration files are applied sequentially in Supabase SQL Editor
- File names describe the change (no numeric prefixes)
- After adding a migration, update `docs/SCHEMA.md` to reflect the new state
- Also update `supabase/schema.sql` to include the changes for fresh installs
- Also update `src/types/index.ts` if column types change

### Common Patterns
- Use `ALTER TABLE` for adding columns
- Set sensible defaults for new columns
- Update triggers when adding computed columns
- Migration files are idempotent where possible (`IF NOT EXISTS`)

## Dependencies

### Internal
- Applied on top of `../schema.sql` base schema
- Must stay in sync with `docs/SCHEMA.md` and `src/types/index.ts`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
