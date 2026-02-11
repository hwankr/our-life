<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# goals

## Purpose
Goal-specific components for editing and managing individual goals.

## Key Files

| File | Description |
|------|-------------|
| `EditGoalDialog.tsx` | Dialog for editing existing goal properties (title, targets, cycle) |

## For AI Agents

### Working In This Directory
- Client component (`'use client'`) for form interactivity
- Calls server actions from `@/app/actions/goal-actions`
- Must handle all three goal types (ROUTINE/LIMIT/OBJECTIVE) in the form
- Goal cycle selection (TOTAL/WEEKLY/MONTHLY) affects which fields are shown

### Common Patterns
- Dialog built with shadcn/ui Dialog component
- Form state managed with React useState
- Toast notifications for success/error feedback

## Dependencies

### Internal
- `@/types` - Goal, GoalType, GoalCycle
- `@/app/actions/goal-actions` - Server actions
- `@/components/ui/*` - Dialog, Button, Input, Label, Select

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
