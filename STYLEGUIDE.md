# Safe Deleter UI Style Guide

This guide adapts the Minimal Monochrome Data UI aesthetic for the Safe Deleter app. It preserves the quiet, ledger-like look while adding app-specific templates for Safe discovery, queue lists, and delete eligibility.

## Core aesthetic
- Quiet, document-like UI that reads like a ledger or technical appendix.
- Monochrome by default; hierarchy via weight, spacing, and rules.
- Lines over boxes; dividers define structure.
- Dense rows, calm sections; avoid visual noise.

## Color system
Use a small grayscale palette with a dark-mode mirror.

### Light mode
- Background: `#FFFFFF`
- Primary text: `#111111`
- Secondary text: `#6A6A6A`
- Tertiary text: `#9A9A9A`
- Strong divider: `#CCCCCC`
- Subtle divider: `#E6E7EB`
- Hover background: `rgba(0,0,0,0.04)`

### Dark mode
- Background: `#1A1A1A`
- Primary text: `#FAFAFA`
- Secondary text: `#D8D8D8`
- Tertiary text: `#A0A0A0`
- Strong divider: `#404040`
- Subtle divider: `#2A2A2A`
- Hover background: `rgba(255,255,255,0.04)`

### Color rules
- No decorative color; only use color for status badges and chain logos.
- Active states use weight and underline, not color.
- UI icons inherit text color; chain logos retain original colors.

## Typography
Always use system monospace fonts.

- Primary UI: `ui-monospace`, `SFMono-Regular`, `Menlo`, `Consolas`
- Data/addresses: same as primary

### Type scale
- Page title: 16-18px, semibold
- Section heading: 18-22px, medium to semibold
- Body text: 12-13px
- Meta/labels: 11-12px, muted
- Table headers: 10-11px, uppercase, letter-spaced
- Dense numeric data: 11-12px, monospace

## Spacing and rhythm
- Use a 4px-based scale: 4, 8, 12, 16, 24, 32, 48.
- Large whitespace between sections, tight spacing within rows.

## Layout
- Single-column default, max width 760-860px.
- Title centered; dense data left-aligned.
- No background panels by default.

### Layout stability
- `overflow-y: scroll` on `html` to avoid shifts.
- Fixed min-height for queue lists and empty states.
- Min-width on badges to prevent reflow.
- Skeletons match final dimensions.

## Dividers and structure
- Use 1px dividers.
- Strong divider between sections; subtle divider between rows.
- Avoid vertical grid lines unless required for readability.

## Navigation and tabs
- Text-only tabs; monochrome icons allowed.
- Active: heavier weight + thin underline (2px) with spacing.
- Inactive: muted text, no background.
- Back navigation uses an icon-only left arrow with tail (no text arrows).

## Status badges
Color is allowed only for status badges to aid scanning.

### Badge rules
- Small pill, subtle background, readable text.
- Keep colors muted and desaturated.
- Set `min-width` for stability.

### Safe Deleter statuses
- Queue state: `Queued`, `Executed`, `Failed` (if surfaced).
- Eligibility: `YOURS`, `NOT YOURS`, `UNKNOWN` (when proposer absent).

Use muted palette (light/dark equivalents):
- `YOURS`: emerald-100 / emerald-700 (dark: emerald-900/40 / emerald-300)
- `NOT YOURS`: gray-100 / gray-600 (dark: gray-800 / gray-400)
- `UNKNOWN`: amber-100 / amber-700 (dark: amber-900/40 / amber-300)

## Buttons and actions
- Primary action: “Connect Wallet” and “Search Safe” only.
- Delete button: text-only or outlined, no fill; enabled only when eligible.
- Disabled state: reduce opacity and disable pointer; add helper text “Only proposer can delete.”
- Confirmation dialog uses the same monochrome palette with a single primary action.

## Addresses and identifiers
- Always monospace, muted text.
- Format: `0x1234...5678` (shortened) or full address where space permits.
- Inline actions: edit (pencil) + external link icons; muted by default, brighten on hover.

### Custom labels
- Users can assign custom names to Safes via pencil icon.
- Stored in localStorage, keyed by lowercase address.
- Display format: `Custom Name` with full address below, or `Custom Name (0x1234...5678)` inline.
- Edit mode: inline text input, save on Enter or blur, cancel on Escape.
- Pencil and external link icons appear inline, small (14px), muted color.

## Lists and tables
Use compact cards for Safe lists (Favorites, My Safes) and divider-separated rows for queue tables.

### Safe cards (Favorites / My Safes)
- Centered layout, max-width 520px.
- Subtle border (`--divider-subtle`) and light shadow (`0 1px 3px rgba(0,0,0,0.06)`).
- Hover: background highlight + slightly stronger shadow.
- Entire card is clickable.
- Star button on right edge; use `stopPropagation` to prevent card click.

### Chain groupings
- Small chain logo (12-14px) next to chain name in group headers.
- Logos are loaded from `logoUrl` in chain registry (Trust Wallet assets).
- Circular crop (`border-radius: 50%`) for consistent appearance.
- Header text: uppercase, letter-spaced, muted color.

### Queue table
```
AGE    NONCE  SAFE TX HASH        PROPOSER       STATUS      ACTION
4h12m  45     0xaaaa...bbbb       0x1234...5678  YOURS       View →  Delete
```
- Header row with subtle bottom divider only; no row dividers.
- Rows highlight on hover with subtle background.
- STATUS is a badge (`YOURS`, `NOT YOURS`, `UNKNOWN`).
- Action buttons are text-only (no borders), muted color, brighten on hover.
- Delete disabled (reduced opacity) when not eligible.
- View opens Safe transaction in new tab with "→" suffix.

## Progress and loading
- Use minimalist CSS spinner: circular border with one side colored, rotating animation.
- Spinner inherits theme colors (`--divider-subtle` for track, `--text-tertiary` for active).
- Lazy load expensive operations (e.g., My Safes) behind a button to avoid rate limits.
- Show spinner inline with "Loading..." text during fetch.
- Avoid blocking the entire UI for API calls.

## Interaction cues
- Hover: subtle background only.
- Clickable items: underline on hover, no color shift.
- External links: append "→" arrow (Unicode U+2192).
- Toasts: monochrome banners, no colored fills; icon optional.
- Toast placement: bottom-right on desktop, bottom-center on mobile.
- Toast duration: 3-4s auto-dismiss, stack up to 3.

## Responsive behavior
- Desktop-first density is acceptable; ensure mobile usability.
- Reduce column gaps; allow non-critical columns to compress.
- Prevent critical data wrapping with `white-space: nowrap`.
- Stack action row on small screens.

## Favorites
- Star icon is outline when inactive, filled when active.
- Use a simple monochrome SVG, no external icon dependency.
- Keep the star small and aligned to the right edge of list rows.

## Dark mode
- Default to `prefers-color-scheme`, but provide a header toggle (moon/sun) to override.
- Toggle icon is monochrome, inherits text color, and uses subtle hover brightness.

## URL design
- Encode search and filters in query params.
- Omit defaults; make non-defaults explicit.

Example:
```
/?safe=0x1234...&chain=eth&hideExecuted=false
```

## Things to avoid
- Bright accents (outside muted status badges).
- Heavy shadows or gradients (subtle card shadows are acceptable).
- Decorative icons without function.
- Tooltips unless necessary.
- Empty states with illustrations.
- Pure black in dark mode.
- Unnecessary dividers or visual separators.

## Mental model
"Could this be printed on paper and still feel correct?"
If yes, it matches the intended aesthetic.
