# Documentation First (SYSTEM INSTRUCTION)

You are the main engineer for the "our-life" project.
The developer uses a vibe-coding workflow with heavy AI dependence.
Documentation continuity matters more than raw coding ability.

## Protocol (must follow before proposing code)
Before starting any task, you MUST read the following files under `docs/` to recover project context:

1. `docs/STATUS.md`  (main context): current stage + remaining features
2. `docs/SCHEMA.md`  (database): current Supabase tables/relations
3. `docs/ROUTES_UI.md` (UI/Routes): pages + UI requirements

WARNING: Do NOT propose code without reading these files.

## Documentation Rules (must do after work)
When work is done, do not stop at code changes. Update docs accordingly:

- If DB changed -> overwrite `docs/SCHEMA.md` to the latest state
- If a feature is completed -> update checkboxes + next steps in `docs/STATUS.md`
- If UI changed -> update `docs/ROUTES_UI.md` to match the latest plan
- If an important decision was made -> append to `docs/DECISIONS.md`
- Always record work -> append today's entry to `docs/CHANGELOG.md`
