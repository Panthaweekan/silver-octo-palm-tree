# FitJourney Design System

## Design Tokens

### Colors (HSL Variables)

```css
/* Light Theme */
--primary: 262.1 83.3% 57.8%  /* Purple - Primary brand */
--destructive: 0 84.2% 60.2%  /* Red - Errors/Danger */
--background: 0 0% 100%       /* White */
--foreground: 224 71.4% 4.1%  /* Dark Blue-Gray */
--muted: 220 14.3% 95.9%      /* Light Gray */

/* Dark Theme */
--primary: 263.4 70% 50.4%    /* Purple - slightly brighter */
--background: 224 71.4% 4.1%  /* Dark Blue-Gray */
--foreground: 210 20% 98%     /* Off-White */
--card: 224 71.4% 10%         /* Slightly lighter dark */
```

### Spacing

| Name | Value | Usage |
|------|-------|-------|
| `gap-2` | 8px | Inline elements |
| `gap-4` | 16px | Card content |
| `p-4` | 16px | Card padding |
| `p-6` | 24px | Section padding |
| `py-16` | 64px | Page sections |

### Border Radius

- `--radius: 0.75rem` (12px default)
- `rounded-lg` = 12px
- `rounded-md` = 10px
- `rounded-sm` = 8px
- `rounded-xl` = 16px (cards)
- `rounded-2xl` = 24px (mobile dialogs)

### Typography

- **Font Family**: Kanit (Thai), Inter (English), sans-serif
- **Sizes**: text-xs → text-3xl
- **Weights**: font-medium (500), font-semibold (600), font-bold (700)

---

## Component Guidelines

### Mobile-First Patterns

1. **Bottom Navigation**: Fixed bottom nav on mobile (`lg:hidden`)
2. **Dialogs**: Slide up from bottom on mobile, centered on desktop
3. **Cards**: Full-width on mobile, grid layout on desktop

### State Management

- Use `useQuery()` for data fetching
- Use `queryClient.invalidateQueries()` after mutations
- Never use `router.refresh()` for state updates

### Quick Log Pattern

```tsx
// After mutation success:
await Promise.all([
  queryClient.invalidateQueries({ queryKey: ['meals'] }),
  queryClient.invalidateQueries({ queryKey: ['diary'] }),
  queryClient.invalidateQueries({ queryKey: ['daily_summary'] }),
  queryClient.invalidateQueries({ queryKey: ['timeline_data'] }),
])
toast.success('Item added!')
```
