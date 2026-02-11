<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# callback

## Purpose
OAuth callback route handler at `/auth/callback`. Exchanges the authorization code for a session and upserts user profile data into the `users` table.

## Key Files

| File | Description |
|------|-------------|
| `route.ts` | GET route handler - exchanges OAuth code, upserts user, redirects |

## For AI Agents

### Working In This Directory
- This is a Route Handler (not a page) - exports `GET` function
- Exchanges `code` query parameter for Supabase session
- On success: upserts user to `users` table (id, email, name from Google metadata, avatar_url)
- On success: redirects to `/app` (or `next` query param)
- On failure: redirects to `/auth/auth-code-error`
- User name fallback: `full_name` -> email prefix -> '사용자'

## Dependencies

### Internal
- `@/lib/supabase/server` - Server Supabase client

### External
- `next/server` - `NextResponse.redirect`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
