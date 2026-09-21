# Reciparian Cakes

This project is a bakery storefront and ordering platform built with Next.js, Supabase, and Paystack. It brings together the customer-facing storefront, authentication, cart, checkout, payment flow, and backend data model into a single working system.

This README combines the earlier project notes, the backend setup guidance, and the later homepage v3 improvements into one explanatory guide.

## What the app does

The core customer journey is:

- browse the menu and custom cake options
- add products to a persistent cart
- choose delivery or pickup
- complete checkout
- pay securely through Paystack
- receive webhook-driven order verification
- continue through the post-purchase confirmation flow

This is a full-stack bakery ordering app rather than a purely static storefront.

## Tech stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase Postgres + Auth
- Paystack payment integration
- Zustand for cart state
- Framer Motion for interactions and drawer animation

## Project structure

```text
.
├── app/
│   ├── actions/
│   ├── api/
│   ├── auth/
│   ├── components/
│   ├── custom-cakes/
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
├── .env.example
├── package.json
├── next.config.ts
├── eslint.config.mjs
├── proxy.ts
├── README.md
└── ...
```

## Local setup

1. Install project dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env.local
```

If the project does not yet have a `.env.example`, add the values manually. Typical variables include:

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

3. Run the app:

```bash
npm run dev
```

4. Visit the local app in the browser and check the menu, auth, cart, and checkout flow.

## Supabase setup

The backend data layer is Supabase.

### Required dashboard configuration

- enable Email authentication and Magic Link sign-in
- configure the app URL and redirect URLs for local development
- add the callback redirect:
  - `http://localhost:3000/auth/callback`
- create the storage bucket `menu-images`
- apply the SQL migrations in the correct order

For production, update the site URL and redirect targets to your hosted domain.

## Database and migrations

The database schema is defined in the migration files under `supabase/migrations`.

The standard order is:

1. `0001_init_schema.sql`
2. `0002_rls_policies.sql`
3. `0003_functions_triggers.sql`
4. `0004_delivery_zone_tiers.sql`
5. `0005_seed_real_data.sql`
6. `0006_menu_item_alt_text.sql`
7. `0007_testimonial_avatars.sql`

These migrations cover:

- categories and menu items
- custom cake pricing and flavor data
- delivery zones and fees
- profiles and addresses
- orders and order items
- wishlist and storefront data

### Important notes from the project docs

- delivery zones are grouped into Port Harcourt neighborhoods and Rivers State LGAs
- custom cake pricing is seeded with confirmed bakery values
- some flavor upcharge values and custom cake add-on prices were intentionally left empty until the bakery confirms the real numbers
- admin role assignment is usually handled manually after signup

## Authentication and guest-order flow

The auth system includes:

- email/password signup and login
- magic link login
- Google OAuth support
- callback handling through `app/auth/callback/route.ts`
- guest-order linking after verification

### Guest-order matching

When a guest completes checkout and later signs up or logs in, the app matches the order to the authenticated user by exact email when the order still has no `user_id`. This is done server-side so it does not overexpose order access.

This keeps the order model secure while still allowing guest purchases to become linked to a real account when the customer confirms their identity.

## Menu, cart, and storefront behavior

The storefront contains several important UX features:

- searchable and filterable menu browsing
- category navigation
- cart drawer interaction
- quantity controls and subtotal recalculation
- localStorage persistence for the cart
- custom cake configurator flow

### Cart behavior

The cart is intentionally designed to:

- merge duplicate menu items by their `menuItemId`
- treat custom cakes as unique only when their configuration matches exactly
- preserve cart contents across reloads

## Checkout and payment flow

The checkout flow is a full order lifecycle:

1. the customer fills out the form
2. the order is submitted with delivery or pickup selection
3. the server validates and re-prices the items from the database
4. a pending payment order is created
5. a Paystack transaction is initialized
6. the customer pays on the hosted Paystack page
7. the webhook confirms the payment
8. the order status is updated and the verification page loads

Relevant backend routes include:

- order status checking
- Paystack webhook handling
- stale or expired order cleanup

This design keeps payment verification secure while allowing a guest customer to check their own order status without exposing all order data.

## Home page v3 update

The later homepage documentation includes several frontend improvements that were ultimately folded into the main app:

### 1. Custom Cakes was not actually wired in

The old flow treated custom cakes as a separate pricing system, not as rows in `menu_items`. The fix was to create a real `/custom-cakes` page and connect it to the live pricing, flavor, and add-on data instead of leaving users at an empty category view.

### 2. Photo and branding improvements

The final home page iteration used a real hero photo and a stronger brand color system. The new brown accent color (`brand-espresso`) was added so the site had better contrast and a stronger bakery identity than the previous pastel-only palette.

### 3. Testimonials with avatars and swipe support

A `testimonial_avatars` migration adds `avatar_url` support to the testimonials model, and the testimonial carousel was adjusted to show photos or initials, with swipe gestures on top of the auto-advance behavior. The project intentionally avoids fake testimonial data until real reviews are available.

### 4. Performance note

The docs explain that production-like Lighthouse numbers should be measured with a production build (`npm run build` + `npm run start`) rather than relying on the unbundled dev server experience. This is the more realistic performance signal for a mobile user.

## Notifications and order lifecycle

The project supports:

- admin order alerts
- customer email receipts
- WhatsApp click-to-chat links
- order expiry for abandoned payments

Some parts of the notification flow are intentionally deferred until the bakery confirms the exact business rules, but the lifecycle hooks are already designed for them.

## Current gaps and pending decisions

Some items still need real business data before the app is fully production-ready:

- real custom cake flavor upcharges
- real custom cake add-on prices
- real product photos and menu image URLs
- final delivery zone fees and logistics rules
- remaining admin dashboard or profile screens
- production-grade notification tuning and operational checks

These are not guessed values; they are intentionally left blank until the bakery confirms them.

## Useful commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Final project status

The project is in a strong state overall: the menu, cart, auth flow, checkout, and backend payment lifecycle are all represented in the codebase. The main work still left is final data cleanup, content confirmation, and a polished production validation pass.

The largest remaining tasks are:

- confirm real pricing and add-on data
- validate Supabase migrations against the live source of truth
- confirm environment variables and webhook configuration
- run end-to-end Paystack testing in a real environment
