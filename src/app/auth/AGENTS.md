<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# auth

## Purpose
Authentication routes for Google OAuth flow via Supabase Auth. Handles login initiation, OAuth callback processing, and error display.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `login/` | Login page with Google OAuth button (see `login/AGENTS.md`) |
| `callback/` | OAuth callback route handler (see `callback/AGENTS.md`) |
| `auth-code-error/` | Authentication error display page (see `auth-code-error/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- OAuth flow: Login page -> Google -> Callback route -> Redirect to /app
- Error handling redirects to `auth-code-error` page
- Login page uses browser Supabase client for `signInWithOAuth()`
- Callback uses server Supabase client to exchange code for session

### Auth Flow
```
/auth/login         → User clicks "Google로 로그인"
                    → Supabase redirects to Google OAuth
Google              → User authorizes
                    → Redirects to /auth/callback?code=...
/auth/callback      → Exchange code for session
                    → Redirect to /app (success) or /auth/auth-code-error (failure)
```

## Dependencies

### Internal
- `@/lib/supabase/server` - Server client for callback
- `@/lib/supabase/client` - Browser client for login

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
