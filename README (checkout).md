# Phase 5, Slice 3 — Checkout + Verify

This is the piece that finally closes the full loop: cart → checkout →
Paystack → webhook → order status → email/WhatsApp notifications, all
built in earlier phases and now actually connected end to end.

## What's here
- `app/actions/delivery-zones.ts` — fetches active zones for the dropdown
- `app/checkout/page.tsx` + `app/components/CheckoutForm.tsx` — the checkout form itself: order summary, customer details, Delivery/Pickup toggle, grouped zone dropdown (PH Areas / Other LGAs), calls the `checkout()` server action from Phase 1
- `app/api/orders/status/route.ts` — a dedicated status-check route, **not** direct table access
- `app/checkout/verify/page.tsx` — polls order status every 3s while pending, shows a processing spinner, then the real confirmation screen once the webhook (Phase 1 + 4) has done its job

## A security decision worth understanding, not just copying
Your `orders` RLS policy only lets the order's owner or an admin read it. A
guest checkout has no owner (`user_id` is null), so they'd be blocked from
even checking their own order's status. Rather than loosening `orders` RLS
to allow broader anonymous reads — which would let anyone enumerate order
data if they guessed a UUID — `app/api/orders/status/route.ts` looks orders
up by `order_reference` specifically. That reference is a long, random,
timestamp+hex string (`ORD_<timestamp>_<random>`), genuinely unguessable —
the same trust model Paystack's own `callback_url` already relies on. This
keeps RLS tight while still letting guests see their own order.

## Where these go
All paths shown above are relative to your project root (`app/`, no `src/`).
Note: `CheckoutForm.tsx` imports `PostCheckoutAccountPrompt` from
`@/app/components/PostCheckoutAccountPrompt` — confirm that's actually
where you placed it back in Phase 2 (some of your earlier components ended
up in `app/components/`, so this assumes that's still the location).

## No new dependencies
Everything here uses packages already installed — `react-hook-form`, `zod`,
`@hookform/resolvers`, `zustand`.

## Cart clearing — when it actually happens
Not at form submission. If someone abandons the Paystack payment page and
comes back, their cart should still be waiting for them — so `clearCart()`
only fires once `/checkout/verify` confirms the order actually reached a
paid status.

## Testing this — the real end-to-end run
1. Copy all files in per the paths above
2. Make sure your Paystack keys in `.env.local` are **test** keys, and
   `NEXT_PUBLIC_SITE_URL` matches whatever URL you're actually testing from
   (your Codespaces forwarded URL, not `localhost`, if that's how you're
   accessing it — same issue as the Server Actions origin mismatch you hit
   earlier)
3. Add an item to cart from `/menu`, open the drawer, click Checkout
4. Fill in the form — try both Delivery and Pickup to confirm both paths work
5. Submit — you should be redirected to Paystack's hosted payment page
6. Use one of Paystack's test card numbers (see their docs) to complete a test payment
7. You should land back on `/checkout/verify?reference=...`, see the
   processing spinner, then (once the webhook fires) the real confirmation
   screen with your order details
8. Check: did the customer receipt and admin alert emails actually arrive
   (Phase 4)? Does the WhatsApp button in the admin email open a chat with
   the right number pre-filled?
9. For a guest order, confirm the `PostCheckoutAccountPrompt` shows up on
   the success screen with your email pre-filled

If the webhook never fires locally: Paystack needs a publicly reachable URL
to send the webhook to, which `localhost` isn't. Your Codespaces forwarded
URL should work since it's a real HTTPS endpoint — just make sure the
webhook URL is registered in your Paystack dashboard (Settings → API Keys &
Webhooks) pointing at your-codespaces-url/api/webhooks/paystack.

## What's still not here
- The custom cake configurator isn't wired into a page yet, so only plain
  menu items can currently be tested through this flow
- No visual distinction yet for expired or cancelled order statuses on
  the verify page beyond the generic "There was an issue" fallback
