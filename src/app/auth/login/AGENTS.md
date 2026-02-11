<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# login

## Purpose
Login page at `/auth/login`. Client component that initiates Google OAuth flow via Supabase Auth.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Login page with Google OAuth button, loading state, and back-to-home link |

## For AI Agents

### Working In This Directory
- Client component (`'use client'`) using browser Supabase client
- Calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Redirect URL set to `/auth/callback` via `window.location.origin`
- Loading spinner shown during OAuth redirect
- Korean UI text for button labels and descriptions

## Dependencies

### Internal
- `@/lib/supabase/client` - Browser Supabase client
- `@/components/ui/button` - Button component
- `@/components/ui/card` - Card layout

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
