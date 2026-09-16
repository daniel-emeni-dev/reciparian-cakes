# Phase 5, Slice 2 — Cart

## What's here
- `lib/store/cart.ts` — Zustand store, persisted to localStorage, holds cart items in the exact shape the checkout server action expects (`CartLineItem`), plus display-only fields (name, image, price snapshot)
- `lib/store/cart-ui.ts` — separate, **non-persisted** store just for whether the drawer is open (shouldn't survive a page reload the way cart contents should)
- `app/components/CartButton.tsx` — cart icon with a live item-count badge
- `app/components/CartDrawer.tsx` — the slide-out panel, fade + slide animation via Framer Motion, quantity controls, remove, subtotal, "Checkout" button
- Updated `app/components/InteractiveMenu.tsx` — "Add to Cart" now actually adds to the store and opens the drawer, replacing the placeholder alert

## New dependency
This needs `zustand`, which isn't installed yet:
```bash
npm install zustand
```

## Where these go
- `lib/store/cart.ts`, `lib/store/cart-ui.ts` → your `lib/store/` folder (create it)
- `app/components/CartButton.tsx`, `app/components/CartDrawer.tsx` → your `app/components/` folder
- `app/components/InteractiveMenu.tsx` → **replaces** your current version (adds the cart wiring on top of the design fixes from last time — this supersedes that file, not a separate merge)

## Wiring into your layout — required step, not optional
The cart button and drawer need to render on every page, not just `/menu`. Open your `app/layout.tsx` and add them near your header/nav:

```tsx
import { CartButton } from '@/app/components/CartButton'
import { CartDrawer } from '@/app/components/CartDrawer'

// ...inside your layout, likely in a header/nav area:
<CartButton />

// ...once, anywhere in the layout body (it renders as a fixed overlay,
// position in the JSX doesn't matter):
<CartDrawer />
```

If you don't have a shared header yet, both can just go directly in the root layout body for now — `CartButton` needs to be somewhere visible/clickable, `CartDrawer` just needs to exist once anywhere in the tree.

## How "same item" detection works
- Two `menu_item` lines are the same item if they share the same `menuItemId` — adding "Banana Bread" twice increases its quantity to 2, doesn't create a duplicate row, per your instruction.
- Two `custom_cake` lines are only "the same" if their entire configuration matches exactly (same finish, size, flavor, addons). A 7" buttercream vanilla cake and an 8" fondant chocolate cake are genuinely different lines, not quantities of "a custom cake" — this matters once the cake configurator is wired in.

## What's NOT here yet
- **The `/checkout` page itself.** The drawer's "Checkout" button already routes to `/checkout`, but that page doesn't exist — clicking it will 404 for now. That's the next slice, and you flagged it needs real bakery-specific logistics (delivery zone picker, pickup details) beyond a generic form, so it's getting its own dedicated pass rather than a quick stub.
- The custom cake configurator isn't wired to `addItem` yet — only plain menu items are, since the configurator component exists standalone from your original doc but hasn't been connected to a page yet.

## Testing this
1. `npm install zustand`
2. Copy files in per the paths above, wire `CartButton`/`CartDrawer` into your layout
3. `npm run dev`, visit `/menu`
4. Click "Add to Cart" on an item — drawer should slide in with fade animation, item shown
5. Click "Add to Cart" on the same item again — quantity should go to 2, not a duplicate row
6. Use the +/− buttons, confirm quantity updates and subtotal recalculates
7. Close the tab entirely, reopen `/menu` — cart should still have your items (localStorage persistence)
8. Click "Remove" on an item — confirm it disappears
