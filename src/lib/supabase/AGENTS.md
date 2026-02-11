<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# supabase

## Purpose
Supabase client configuration for different execution contexts. Provides four client variants: browser, server (cookie-based), admin (service role), and middleware (request/response cookie management).

## Key Files

| File | Description |
|------|-------------|
| `client.ts` | Browser-side Supabase client using `createBrowserClient` |
| `server.ts` | Server-side client with cookie-based auth using `createServerClient` |
| `admin.ts` | Admin client with service role key - bypasses RLS |
| `middleware.ts` | Middleware session updater - refreshes auth tokens, protects routes |

## For AI Agents

### Working In This Directory
- **NEVER** use `admin.ts` client in browser/client code - service role key must stay server-side
- Use `client.ts` in `'use client'` components
- Use `server.ts` in Server Components and Server Actions
- Use `admin.ts` only in Server Actions for privileged mutations
- `middleware.ts` is called by `src/proxy.ts` (Next.js middleware)

### Client Selection Guide
| Context | Client | File |
|---------|--------|------|
| Client Component (`'use client'`) | `createClient()` | `client.ts` |
| Server Component | `createClient()` | `server.ts` |
| Server Action (`'use server'`) - reads | `createClient()` | `server.ts` |
| Server Action - writes (RLS bypass) | `createAdminClient()` | `admin.ts` |
| Middleware | `createServerClient()` | `middleware.ts` |

### Security Notes
- Admin client requires `SUPABASE_SERVICE_ROLE_KEY` env var
- Middleware protects `/app` routes - redirects unauthenticated users to `/`
- Cookie handling silently catches errors in Server Components (read-only context)

## Dependencies

### External
- `@supabase/ssr` - `createBrowserClient`, `createServerClient`
- `@supabase/supabase-js` - `createClient` (admin)
- `next/headers` - `cookies()` for server client
- `next/server` - `NextRequest`, `NextResponse` for middleware

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
