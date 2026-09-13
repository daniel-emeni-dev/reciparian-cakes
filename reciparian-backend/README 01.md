# Phase 3 — Real Seed Data

## What's here
- `supabase/migrations/0004_delivery_zone_tiers.sql` — adds a `zone_tier` column (`ph_neighborhood` / `lga`) to `delivery_zones` so the checkout UI can group them
- `supabase/migrations/0005_seed_real_data.sql` — categories, all 9 PH neighborhoods + 23 Rivers State LGAs (₦3,000 flat each), confirmed custom cake pricing, flavor list, and every menu item from the Care Card
- `lib/content/bakery-info.ts` — contact info, address/hours, and Care Card copy for the About/Contact pages (Phase 5)

## Running the migrations

Same process as Phase 1 — paste each file into the Supabase SQL editor **in order**, `0004` before `0005`:

1. `supabase/migrations/0004_delivery_zone_tiers.sql`
2. `supabase/migrations/0005_seed_real_data.sql`

If you already have rows in `custom_cake_pricing` from Phase 1's original migration, `0005` uses `on conflict (finish, size_inches) do update` so it safely overwrites with the same confirmed numbers rather than erroring on duplicates.

## What's genuinely seeded now
- ✅ Delivery zones: 32 total (9 PH neighborhoods + 23 LGAs), ₦3,000 flat, per your confirmation
- ✅ Custom cake base pricing (all sizes, both finishes)
- ✅ Menu items: all Cupcakes & Pastries and Reciparian Specials, real prices
- ✅ Categories (Cupcakes & Pastries, Reciparian Specials, Custom Cakes)
- ✅ Contact info, address, hours, Care Card copy

## What's still intentionally blank — not guessed
- **Flavor upcharges** (`custom_cake_flavors.upcharge_amount`) — Strawberry, Coconut, Chocolate, Cookies and Cream, Mixed Fruit, Lemon, Banana, Coffee are all marked `is_included = false` but the amount stays `null`. No number was given.
- **Custom cake add-ons** (pictures, toppers, toppings) — `custom_cake_addons` table stays empty. Costs are mentioned but no prices given anywhere yet.
- **Product photos** — see the note at the bottom of `bakery-info.ts`. Pulling images from Instagram isn't something to automate; the recommended flow is downloading them yourself and running them through the `/api/upload` route from Phase 1, then attaching the returned URL to the right `menu_items.image_url`.

## Still needed before this phase can close out
- Real flavor upcharge amounts
- Real add-on prices
- Product photos uploaded and attached to menu items
