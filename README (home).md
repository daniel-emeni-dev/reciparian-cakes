# Phase 5, Slice 4 — Home Page

## Why some of the requested content isn't here
You asked for social proof numbers (star ratings, review counts, "10,000+
celebrations") and specific product claims (organic sourcing, gluten-free
options, nut-free facility, temperature-controlled shipping). I didn't
build those in, and here's why directly: they're either unverified or
actively contradicted by your own project data.

Your Care Card explicitly warns treats "contain nuts like coconut,
almonds, peanuts, walnuts, pistachios, hazelnuts etc." — the opposite of a
nut-free claim. There's no organic sourcing or gluten-free/vegan data
anywhere in your seeded menu. And your testimonials system (Phase 1
schema) is explicitly built as admin-moderated — no reviews have been
collected yet, so "4.9/5 stars, 500+ reviews" would be a specific,
checkable false statement on a live commercial site, not a placeholder.

What I built instead: only claims that are true right now, sourced
directly from your Care Card and the real delivery/checkout system
already built (Baked Fresh Daily, Delivery Across Rivers State, Pickup or
Delivery). The allergen section turns your actual caution into an honest
transparency note instead of hiding it.

## What's here
- app/page.tsx, the home page itself
- app/components/Hero.tsx, logo, sensory headline, dual CTAs, honest trust indicators
- app/components/CategoryShowcase.tsx, real categories from your database, fade-in on scroll
- app/components/TestimonialsCarousel.tsx, auto-advancing every 5s, with a genuinely honest empty state ("we're just getting started collecting reviews") instead of fake reviews, since none exist yet
- app/components/FadeInSection.tsx, reusable scroll-triggered fade-in, used throughout. Uses Framer Motion's whileInView, which is IntersectionObserver based, not a scroll event listener, this is the performant way to do it, won't hurt your Lighthouse score the way scroll listener animations can
- app/components/AnimatedCounter.tsx, counts up from 0 using requestAnimationFrame (cheap, GPU friendly). Built and ready, but not called anywhere yet, there's no real number to show. The moment you have a genuine stat (real review count, real order count), this component is ready to plug in
- app/actions/testimonials.ts, fetches only is_published = true testimonials
- app/components/SiteHeader.tsx, updated to use your real logo image instead of the cursive text wordmark. This also permanently fixes the mobile overflow bug from before, since a fixed size image can't cause the same text width overflow issue

## Logo files, need to be copied into your project
Your two uploaded logos go into a public/ folder at your project root
(create it if it doesn't exist, Next.js serves anything in public/
directly):
- reciparian-logo.png (the white background version) -> public/reciparian-logo.png
- reciparian-logo-outline.png (the outline version) -> public/reciparian-logo-outline.png
  (not used yet, but kept available for later, e.g. a dark background footer)

## Where the .tsx files go
All under app/, page.tsx at the root, everything else in
app/components/ and app/actions/, matching your existing structure.

## What's deferred, flagged honestly
- Category cards link to /menu generally, not a filtered view. Your
  InteractiveMenu component doesn't read a category from the URL yet,
  clicking "Custom Cakes" takes you to the full menu, not pre-filtered to
  that category. Small addition if you want it wired properly (reading a
  ?category= query param and pre-selecting that filter pill), just say
  so and I'll build it rather than leave it silently broken feeling.
- No hero photo/video, still no real product photography, so the
  hero uses your logo plus a brand color gradient background instead of a
  food shot. Swap ready the moment real photos exist.

## Testing this
1. Copy the two logo files into public/
2. Copy all the component/action files in, replace SiteHeader.tsx
3. npm run dev
4. Visit /, confirm: logo loads in the hero and header, headline reads
   correctly, both CTA buttons go to /menu, trust indicators show,
   category cards render from your real categories, scrolling triggers
   the fade-ins smoothly, testimonials section shows the honest "just
   getting started" message (since no published testimonials exist yet)
5. Confirm the header logo fix holds at the same narrow mobile width that
   broke before
