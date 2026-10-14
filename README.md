# Reciparian Cakes

A full-stack bakery storefront and ordering platform built to support menu browsing, custom cake requests, customer accounts, delivery or pickup, and online payment.

The project brings the customer-facing experience and order lifecycle into one application, with Supabase for data and authentication and Paystack for payment processing.

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-typed%20JavaScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3FCF8E?logo=supabase&logoColor=white)
![Paystack](https://img.shields.io/badge/Payments-Paystack-00C3F7)

## Project goals

- Make bakery products and custom cake options easy to browse.
- Provide a persistent cart and a clear checkout flow.
- Support delivery and pickup choices.
- Initialize Paystack payments and verify payment status server-side.
- Give customers a way to access their orders after signing in.

## Main capabilities

### Storefront and menu
- Menu browsing, search, and category navigation.
- Custom cake configurator and pricing data.
- Responsive product presentation.

### Cart and checkout
- Persistent cart with quantity and subtotal updates.
- Delivery or pickup selection.
- Server-side validation and repricing before an order is created.
- Paystack transaction initialization and webhook-based payment verification.
- Order status and post-purchase confirmation flow.

### Accounts and data
- Email/password authentication and magic-link login.
- Google OAuth support configured through Supabase.
- Guest-order linking after a customer verifies their identity.
- Supabase migrations and row-level security policies.

### Customer experience
- Cart drawer and motion-enhanced interactions.
- WhatsApp click-to-chat links.
- Customer email receipts and order lifecycle notifications where configured.

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js App Router |
| UI | React, TypeScript, Tailwind CSS |
| Database and authentication | Supabase PostgreSQL and Auth |
| Payments | Paystack |
| Cart state | Zustand |
| Animation | Framer Motion |
| Deployment | Vercel |

## Order and payment lifecycle

1. The customer chooses products and delivery or pickup.
2. The server validates the submitted items and recalculates prices using trusted data.
3. A pending order is created and a Paystack transaction is initialized.
4. The customer completes payment through Paystack.
5. The server verifies the payment notification and updates the order status.
6. The customer continues to the relevant confirmation experience.

Payment status must be determined by trusted server-side verification, not by a client-side redirect alone.

## Project structure

```text
app/                 Next.js routes, pages, and API handlers
lib/                 Shared logic, stores, and Supabase helpers
supabase/            Database migrations and backend configuration
types/               Shared TypeScript types
public/              Static assets
reciparian-backend/  Supporting backend project files
```

## Run locally

You'll need Node.js and npm.

```bash
git clone https://github.com/daniel-emeni-dev/reciparian-cakes.git
cd reciparian-cakes
npm install
```

Create `.env.local` from `.env.example` if it is available. Configure the Supabase and Paystack values required by the current source code. Never commit secret keys.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

The database schema and policies are defined in `supabase/migrations`. Apply the migrations in order, configure the required authentication providers and redirect URLs, and set up any storage buckets referenced by the app.

For production, use the deployed site's URL in the Supabase redirect configuration.

## Before production

The repository documentation identifies business data and operational checks that still need confirmation, including custom-cake add-on pricing, product imagery, delivery-zone fees, webhook configuration, and end-to-end payment testing. Confirm these details with the bakery before accepting live orders.

## Useful commands

```bash
npm run dev
npm run build
npm run lint
```

## Built for

**Reciparian Cakes** — a bakery ordering experience for cakes, pastries, and custom orders.

Developed by **Daniel Emeni** · [GitHub](https://github.com/daniel-emeni-dev)
