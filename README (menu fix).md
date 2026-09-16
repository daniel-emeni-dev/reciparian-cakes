# Phase 5, Slice 1 fix — Design cleanup

## What changed and why

### 1. Brand color tokens (fixes a real Code Standards violation)
Your Code Standards say *"Never hardcode colors. Never use raw Tailwind colors."*
The first version of the menu page used `amber-600` as a placeholder accent —
that broke the rule. This fix adds your actual 5 brand colors as proper
Tailwind v4 theme tokens.

**You need to merge `app/globals-tokens-addition.css` into your existing
`app/globals.css`** — don't replace the whole file, just add the `@theme`
block (or merge its contents into your existing `@theme` block if you already
have one) so `bg-brand-pink-medium`, `bg-brand-green`, etc. become valid
Tailwind classes project-wide, usable in any component going forward.

Applied here:
- Active category pill + search focus ring: `brand-pink-medium` (#FFC1D6)
- "Add to Cart" button: `brand-green` (#C2FFC8)
- Photo placeholder background: `brand-cream` (#FFFEE0)

### 2. Typography
Added **Pacifico** (a genuine cursive/script font) via `next/font/google`,
applied only to the big page heading — not item names, prices, or buttons,
since cursive at small sizes hurts readability and this is a boutique bakery
site, not a wedding invitation. Body text stays on your existing sans-serif.

If you want this same cursive treatment on the home page hero later, same
pattern: import `Pacifico` from `next/font/google`, apply `pacifico.className`
only to the heading element.

### 3. Search focus state
The stray-looking focus border you saw may have just been a devtools
artifact (the element panel highlighting the last-inspected element), but
either way the ring color is now your real brand pink instead of amber, and
`outline-none` is set explicitly so there's no double-border from the
browser's default outline stacking with the Tailwind ring.

### 4. Clear button (new — you asked for this one directly)
The search input now shows a small "×" button on the right side, but only
once there's actual text typed — clicking it clears the search instantly.
This is a small but real UX gap that's now closed.

## Where these go
- `app/globals-tokens-addition.css` → merge its contents into your existing `app/globals.css`
- `app/menu/page.tsx` → replaces your current version
- `app/components/InteractiveMenu.tsx` → replaces your current version (confirmed this is your actual path, not root-level `components/`)

## Testing this
1. Merge the CSS tokens in first — this is the one step that's a merge, not a straight file swap
2. Replace the two `.tsx` files
3. `npm run dev`, visit `/menu`
4. Confirm: heading renders in cursive, category pills and Add to Cart button use pink/green instead of amber, typing in search shows a clear button, clicking it empties the field
