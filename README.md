# Reciparian Cakes

Reciparian Cakes is a Next.js storefront and ordering platform for a boutique bakery. The project combines a customer-facing menu and cart experience with Supabase-powered authentication, a Postgres order flow, and Paystack-based payment processing.

This README consolidates the project documentation into one source of truth, covering setup, data model, feature flow, and current implementation status.

## Overview

The application is built around a typical bakery ordering flow:

- browse menu items and custom cakes
- add items to a persistent cart
- choose delivery or pickup
- submit checkout form
- pay via Paystack
- wait for webhook-driven verification
- confirm order status and customer follow-up

The stack is:

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Paystack
- Zustand for cart state
- Framer Motion for UI transitions

## Project structure

```text
.
├── app/
│   ├── actions/
│   ├── api/
│   ├── auth/
│   ├── components/
│   ├── login/
│   ├── menu/
│   ├── signup/
│   └── ...
├── lib/
│   ├── content/
│   ├── store/
│   ├── supabase/
│   └── ...
├── public/
├── reciparian-backend/
├── supabase/
├── types/
├── package.json
├── next.config.ts
├── eslint.config.mjs
├── proxy.ts
├── .gitignore
└── README.md
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

If there is no `.env.example` file in the project root, add the values manually in `.env.local` using the keys the app expects, including:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=
PAYSTACK_WEBHOOK_SECRET=
CRON_SECRET=
```

3. Start the app:

```bash
npm run dev
```

4. Open the local app in the browser and verify the menu, auth, and checkout flows.

## Database and migrations

Supabase is the primary backend data layer. The database schema and policies are run through migration files in the project.

Migration order used by the project:

1. `supabase/migrations/0001_init_schema.sql`
2. `supabase/migrations/0002_rls_policies.sql`
3. `supabase/migrations/0003_functions_triggers.sql`
4. `supabase/migrations/0004_delivery_zone_tiers.sql`
5. `supabase/migrations/0005_seed_real_data.sql`

These provide the tables for:

- categories and menu items
- custom cake pricing and flavors
- delivery zones and fees
- profiles and addresses
- orders and order items
- wishlist and other storefront data

Important database notes from the project docs:

- delivery zones are grouped into Port Harcourt neighborhoods and Rivers State LGAs
- custom cake pricing is seeded with confirmed bakery values
- some flavor add-on amounts and custom cake add-on prices are intentionally left blank until confirmed because no real numbers were provided
- admin role promotion is usually done manually after signup

## Supabase setup

In the Supabase dashboard:

- enable Email auth and magic link sign-in
- configure the site URL and redirect URLs for local dev
- add the required authentication redirect target:
  - `http://localhost:3000/auth/callback`
- create a storage bucket named `menu-images` for uploaded product imagery

For real deployment, update your site URL and redirect targets to the production origin.

## Authentication and guest-order flow

The auth system includes:

- email/password sign-up and login
- magic-link login
- Google OAuth support
- callback handling via `app/auth/callback/route.ts`
- guest-order linking after account verification

The guest-order linking logic automatically matches a guest order to a confirmed user when their email matches exactly and the order still has no `user_id` attached. This is handled server-side to avoid opening up broad order reads.

The project also includes a post-checkout account prompt that appears when a paid guest order has no linked user account yet.

## Menu and cart experience

The storefront includes:

- interactive menu browsing
- category filtering and search
- product cards with add-to-cart actions
- a cart drawer with quantity controls and subtotal updates
- persisted cart state using Zustand + localStorage

The cart logic is intentionally designed to:

- group identical menu items by shared `menuItemId`
- treat custom cake lines as distinct only when their config matches exactly
- preserve cart contents across browser reloads

## Checkout and payment flow

The checkout flow is built around a full order creation and payment lifecycle:

1. customer fills out order details
2. order summary and delivery/pickup options are submitted
3. server action validates the order and re-prices items from the database
4. a pending payment order is created
5. Paystack transaction is initialized
6. customer pays on the hosted Paystack page
7. webhook confirms payment
8. order status is updated and verification page loads

The project includes dedicated routes for:

- order status checking
- Paystack webhook handling
- stale or expired order cleanup

This is the key logic that keeps the business flow secure while still allowing a guest customer to check their own payment status without exposing all order data.

## Notifications and order lifecycle

The project was designed to support:

- admin order alerts
- customer email receipts
- WhatsApp click-to-chat links
- order expiry for abandoned payments

Some notification and follow-up steps are planned or intentionally deferred until the project requirements are confirmed, but the order lifecycle and webhook hooks are already in place to support them.

## Remaining project gaps

The documentation indicates several items still need confirmation or implementation before the project is fully complete:

- real flavor upcharge amounts for custom cakes
- real add-on prices for custom cake options
- actual product photos and menu image URLs
- final delivery zone pricing and logistics details
- any remaining admin dashboard and profile pages
- production-ready notification tuning and operational checks

These are not guesses; they are intentionally left blank until the bakery confirms the real business data.

## Useful commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Implementation notes from the earlier project phases

The repository historically had several phase-based implementation notes, including:

- auth and magic-link setup
- Google OAuth support
- cart implementation
- checkout flow and payment verification
- sticky header and menu layout fixes
- real seed data for bakery content and delivery zones

Those notes have been combined here into one source of truth so the project is easier to understand without chasing multiple README files.

## Current status

The project is in a strong hybrid state: the storefront UI, cart, auth, checkout flow, and backend payment hooks are all represented in the codebase, while some final business data and UX details still require bakery confirmation before the application can be considered fully production-ready.

The most important next steps are:

- complete the remaining pricing and image data
- verify all migration data against the bakery source of truth
- confirm production environment variables and webhook configuration
- test the full checkout flow end-to-end with Paystack test credentials
