<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# types

## Purpose
Centralized TypeScript type definitions for the entire application. Single `index.ts` file exports all database entity types, form data types, and computed result types.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | All TypeScript interfaces and type aliases |

## For AI Agents

### Working In This Directory
- All types are defined in a single file for simplicity
- Import types via `@/types` (barrel export)
- Comments are in Korean
- When database schema changes, update types here AND in `docs/SCHEMA.md`

### Type Categories

| Category | Types | Description |
|----------|-------|-------------|
| Enums | `GoalType`, `GoalCycle` | `'ROUTINE' \| 'LIMIT' \| 'OBJECTIVE'` and `'TOTAL' \| 'WEEKLY' \| 'MONTHLY'` |
| Entities | `User`, `Period`, `Goal`, `DailyLog`, `GoalLog` | Database table row types |
| Extended | `GoalWithLogs`, `DailyLogWithGoalLogs` | Entities with joined relations |
| Forms | `GoalFormData`, `DailyLogFormData` | Input form shapes |
| Computed | `GoalProgress` | Progress calculation results |

### Key Details
- `Goal.target_value` and `Goal.achieved_value` are `number | null` (support decimals)
- `GoalLog.subcategory_data` is `Record<string, boolean> | null` (OBJECTIVE subcategory checks)
- `Goal.monthly_limit` is legacy; prefer `Goal.limit_value` for new code
- Date fields use `string` type in YYYY-MM-DD format

## Dependencies

### Internal
- Referenced by virtually every file in the codebase

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
