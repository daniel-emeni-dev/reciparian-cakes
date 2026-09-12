# Reciparian Cakes — Backend

Next.js 16 (App Router) + Supabase + Paystack backend for the online ordering
platform. This covers: database schema, RLS, auth, checkout, payment
verification, and order lifecycle. Frontend UI is a separate pass.

## Setup

1. Create a Supabase project.
2. Run the migrations in order (`supabase db push`, or paste each file into
   the SQL editor in order):
   - `supabase/migrations/0001_init_schema.sql`
   - `supabase/migrations/0002_rls_policies.sql`
   - `supabase/migrations/0003_functions_triggers.sql`
3. Create a public Storage bucket named `menu-images`.
4. Generate real types once the schema exists:
   ```
   supabase gen types typescript --project-id <id> > src/types/database.ts
   ```
5. Copy `.env.example` to `.env.local` and fill in Supabase + Paystack keys.
6. Manually promote your own account to admin after signing up once:
   ```sql
   update profiles set role = 'admin' where id = '<your-auth-user-id>';
   ```
7. Wire `/api/orders/expire` to Vercel Cron (or another scheduler) to run
   every 15 minutes, sending `Authorization: Bearer $CRON_SECRET`.

## What's implemented

- **Schema**: categories, menu_items, custom_cake_pricing, custom_cake_flavors,
  custom_cake_addons, delivery_zones, profiles, addresses, orders, order_items,
  wishlist_items, testimonials.
- **RLS**: public read on catalog data, owner-or-admin on personal data,
  admin-only writes on catalog/order status.
- **Auth**: Supabase Auth, auto-creates a `profiles` row on signup via trigger.
- **Checkout** (`src/app/actions/checkout.ts`): validates input with Zod,
  re-prices every line item from the database (never trusts client-sent
  prices), creates a `pending_payment` order + order_items, initializes a
  Paystack transaction.
- **Webhook** (`src/app/api/webhooks/paystack/route.ts`): verifies the
  `x-paystack-signature` HMAC SHA512 header against the raw body, confirms
  `charge.success`, checks the paid amount matches the order total, then
  branches order status by `fulfillment_type` (`awaiting_dispatch` for
  delivery, `ready_for_prep` for pickup).
- **Order expiry**: `expire_stale_orders()` Postgres function + a protected
  cron route that flips `pending_payment` orders older than 30 minutes to
  `expired`.
- **Image upload**: admin-only route, Sharp-optimizes to WebP server-side.

## Open items — need your input before building further

These were flagged in the source doc as unconfirmed and I didn't want to
guess numbers or flows for them:

- **Extra-flavor upcharge amounts** for custom cakes — no fixed number was
  given. `custom_cake_flavors.upcharge_amount` is nullable; seed it once the
  bakery confirms real prices.
- **Custom cake add-on prices** (pictures, toppers) — same situation,
  `custom_cake_addons.price` needs real numbers.
- **Delivery zone fees** — the doc says "demo flat-rate delivery fee";
  `delivery_zones` is ready to seed but needs real per-zone amounts for the
  listed Port Harcourt areas.
- **Admin/customer notifications** (Resend email, WhatsApp click-to-chat) —
  intentionally left as a follow-up so the webhook stays focused; the hook
  point is marked with a `TODO` comment in the webhook route.
- **Account-creation prompt after first checkout** — not yet built; needs a
  decision on where that prompt lives in the checkout-success flow.

## Notes on scope

Per the project's code standards, I kept this to what was clearly specified:
schema, checkout, payment verification, order lifecycle. I didn't build the
orders-history/wishlist/profile *pages* or admin dashboard UI yet — the
tables and RLS are ready for them, but that's frontend work for a later pass.
