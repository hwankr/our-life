<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# docs

## Purpose
Project documentation hub maintaining continuity for AI-assisted development. These files are the single source of truth for project state, database schema, UI routes, architectural decisions, and change history.

## Key Files

| File | Description |
|------|-------------|
| `STATUS.md` | Current development stage, feature checklist, and next steps |
| `SCHEMA.md` | Database table definitions, ERD, and column descriptions (Korean) |
| `ROUTES_UI.md` | Page routing structure and per-page UI component specifications |
| `DECISIONS.md` | Architectural and design decisions log |
| `CHANGELOG.md` | Chronological record of all development work |

## For AI Agents

### Working In This Directory
- **Read before coding**: Always read STATUS.md, SCHEMA.md, and ROUTES_UI.md before proposing any code changes
- **Write after coding**: Update relevant docs after completing any work
- Documents use Korean language for descriptions
- SCHEMA.md must always reflect the current database state exactly

### Update Rules
| Trigger | Action |
|---------|--------|
| Database changed | Overwrite `SCHEMA.md` with latest state |
| Feature completed | Update checkboxes in `STATUS.md` |
| UI changed | Update `ROUTES_UI.md` |
| Design decision made | Append to `DECISIONS.md` |
| Any work completed | Append entry to `CHANGELOG.md` |

### Common Patterns
- STATUS.md uses markdown checkboxes (`- [x]` / `- [ ]`) for feature tracking
- CHANGELOG.md entries are date-stamped
- SCHEMA.md includes column-level documentation in Korean

## Dependencies

### Internal
- Reflects state of `src/` (code), `supabase/` (schema), and root config files

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
