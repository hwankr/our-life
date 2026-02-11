<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-07 | Updated: 2026-02-07 -->

# ui

## Purpose
Base UI component library built with shadcn/ui (Radix UI primitives + Tailwind CSS). These are low-level, reusable building blocks used throughout the application.

## Key Files

| File | Description |
|------|-------------|
| `avatar.tsx` | User avatar with image and fallback |
| `badge.tsx` | Status/label badges |
| `button.tsx` | Button with variants (default, destructive, outline, secondary, ghost, link) |
| `calendar.tsx` | Calendar component wrapping react-day-picker |
| `card.tsx` | Card container (Card, CardHeader, CardTitle, CardContent, CardFooter) |
| `checkbox.tsx` | Checkbox input |
| `dialog.tsx` | Modal dialog (Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle) |
| `dropdown-menu.tsx` | Dropdown menu with items |
| `input.tsx` | Text input field |
| `label.tsx` | Form label |
| `motion-layout.tsx` | Framer Motion animation wrappers (FadeIn, SlideUp, StaggerContainer, StaggerItem) |
| `progress.tsx` | Progress bar |
| `sheet.tsx` | Side panel/drawer |
| `sonner.tsx` | Toast notification provider (Toaster) |
| `textarea.tsx` | Multi-line text input |

## For AI Agents

### Working In This Directory
- Components follow shadcn/ui patterns - installed via `npx shadcn@latest add <component>`
- Use `cn()` from `@/lib/utils` for conditional class names
- All components use `React.forwardRef` pattern for ref forwarding
- Variants defined with `class-variance-authority` (cva)
- `motion-layout.tsx` is a custom file (not from shadcn/ui) providing Framer Motion wrappers

### Adding New Components
1. Run `npx shadcn@latest add <component-name>`
2. Component will be added to this directory automatically
3. Configuration is in `components.json` at project root

### Common Patterns
- `className` prop merged with defaults using `cn()`
- Radix UI primitives for accessibility (keyboard nav, ARIA)
- Tailwind classes for all styling, `dark:` variant for dark mode

## Dependencies

### External
- `@radix-ui/react-*` - Accessible UI primitives
- `class-variance-authority` - Variant management
- `clsx` + `tailwind-merge` - Class merging (via `cn()`)
- `framer-motion` - Animation (motion-layout.tsx)
- `react-day-picker` - Calendar (calendar.tsx)
- `sonner` - Toast notifications (sonner.tsx)
- `lucide-react` - Icons

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
