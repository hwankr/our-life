<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# app

## Purpose
Next.js App Router directory containing all pages, layouts, route handlers, and server actions. Implements the full routing structure: landing page, auth flows, dashboard, period views, user detail views, and daily log pages.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Root layout - Geist fonts, ThemeProvider, Toaster, Korean lang |
| `page.tsx` | Landing page - hero section, feature cards, Google OAuth login link |
| `globals.css` | Global Tailwind CSS styles |
| `favicon.ico` | Site favicon |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `actions/` | Server Actions for data mutations (see `actions/AGENTS.md`) |
| `app/` | Main dashboard page `/app` (see `app/AGENTS.md`) |
| `auth/` | Authentication routes - login, callback, error (see `auth/AGENTS.md`) |
| `periods/` | Period detail routes with nested user/log views (see `periods/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Root `layout.tsx` wraps all pages with ThemeProvider and Toaster
- Landing page (`page.tsx`) redirects authenticated users to `/app`
- All protected routes check auth and redirect to `/` or `/auth/login` if unauthenticated
- Server Components used by default for data fetching

### Route Structure
```
/                                          → Landing (page.tsx)
/app                                       → Dashboard (app/page.tsx)
/auth/login                                → Google OAuth login
/auth/callback                             → OAuth callback handler
/auth/auth-code-error                      → Auth error display
/periods/[periodId]                        → Period summary
/periods/[periodId]/users/[userId]         → User goal detail
/periods/[periodId]/users/[userId]/logs/[date] → Daily log form
```

### Testing Requirements
- Verify auth redirects work correctly for unauthenticated users
- Check that server actions return proper error responses

### Common Patterns
- Pages use `createClient()` from `@/lib/supabase/server` for data fetching
- Auth checks at the top of each page/layout with `redirect()` on failure
- Framer Motion components (`FadeIn`, `SlideUp`, `StaggerContainer`) for animations
- `revalidatePath()` after mutations to refresh server component data

## Dependencies

### Internal
- `@/components/*` - All UI components
- `@/lib/supabase/server` - Server-side Supabase client
- `@/lib/supabase/admin` - Admin client for mutations
- `@/types` - TypeScript interfaces

### External
- `next/navigation` - `redirect`, `useRouter`
- `next/cache` - `revalidatePath`
- `lucide-react` - Icons
- `framer-motion` - Animations

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
