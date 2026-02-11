<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# auth-code-error

## Purpose
Authentication error page displayed when OAuth callback fails. Shows error message with retry and home links.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Error display page with "retry login" and "back to home" buttons |

## For AI Agents

### Working In This Directory
- Simple Server Component (no data fetching)
- Korean error messages
- Links to `/auth/login` (retry) and `/` (home)

## Dependencies

### Internal
- `@/components/ui/button` - Button component
- `@/components/ui/card` - Card layout

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
