# Home page v3 — real photo, color system, testimonial photos, custom cakes fix

## 1. "Custom Cakes" showing nothing, the actual fix
Custom cakes were always a separate, parametric pricing system
(custom_cake_pricing table: finish + size + base_price), never rows in  
menu_items. Filtering the menu grid to that category correctly found
nothing, because there's nothing there to find. The configurator
component existed (from your original project doc) but was never wired
into a real page.

Fixed by:
- app/custom-cakes/page.tsx, a real page, fetches real pricing, flavor,
  and add-on data
- app/components/CustomCakeConfigurator.tsx, rebuilt to use that real
  data (previously hardcoded arrays in the original doc's version) and
  wired to your actual cart store, so "Add to cart" genuinely adds a
  custom_cake line item, in the exact shape your Phase 1 checkout server
  action already knows how to re-price
- CategoryShowcase.tsx and InteractiveMenu.tsx, both places a user could
  reach "Custom Cakes" now correctly send them to /custom-cakes instead
  of a dead end filtered menu view

## 2. Hero photo
Cropped one clean shot (the pink/green drip cake, "Full Cakes" in your
collage) out of the scrapbook image, using it as the hero background with
a dark gradient overlay for text legibility, plus a one time zoom-out
animation on load (1.15x to 1x). The full collage wasn't used as-is,
per what we discussed: individual photos in a 20-image grid become
unreadable at hero size, and decoding one large composite image right at
First Contentful Paint works against your Performance score.

public/hero-cake.jpg is the cropped file, needs to go in your public/
folder alongside the logo files.

## 3. Color system
Added two new tokens (see app/globals-token-addition-v3.css, merge into
your @theme block, don't replace the file): brand-espresso (#4A2E2A) and
brand-espresso-light for hover states. Your existing 5 colors are all
pastels of similar lightness, nothing to anchor real contrast against.
Espresso brown reads as a natural bakery color (literally chocolate and
pastry tones) rather than an unrelated addition. Used for:
- The primary hero CTA button (was flat black, now brand-espresso)
- The stats section background (was generic stone-900, now brand-espresso)
- The custom cake configurator's selected-size pill

## 4. Testimonials with photos and swipe
- New migration: supabase/migrations/0007_testimonial_avatars.sql, adds
  avatar_url to the testimonials table (nullable, falls back to initials)
- TestimonialsCarousel.tsx rebuilt: circular avatar (photo or initials),
  drag to swipe on top of the existing auto-advance every 5s, dot
  indicators still there for direct navigation
- Important: this still reads real data from Supabase and shows the
  honest empty state, since no real testimonials exist yet. I didn't
  seed the database with placeholder reviews, since that table is
  customer facing content you or an admin publish deliberately. The
  moment you send me the 2 real reviewer photos and quotes (plus
  whatever you want for the 3rd, placeholder for now), tell me and I'll
  write the exact insert for you to run, or run it for you if you'd
  rather.

## 5. Performance regression, real explanation, not a dismissal
Your last Lighthouse run showed Device: Mobile selected, which applies a
4x CPU throttle to simulate a real phone. Combined with an unminified,
unbundled npm run dev Turbopack build, this is a well documented gap,
Lighthouse's own team has written about dev mode scores being
unreliable, especially Total Blocking Time under mobile throttling. This
isn't me waving off a real problem, please run this once you've applied
everything in this batch:
  npm run build
  npm run start
Then run Lighthouse against that (still fine to test on Mobile device
setting, that part's correct to keep). That's the number that actually
reflects what a real visitor's phone would experience, and it's the one
worth acting on if it's still low.

## Where everything goes
- public/hero-cake.jpg, into your public/ folder
- app/globals-token-addition-v3.css, merge into your @theme block
- app/components/Hero.tsx, StatsSection.tsx, CategoryShowcase.tsx,
  InteractiveMenu.tsx, TestimonialsCarousel.tsx, replace existing versions
- app/components/CustomCakeConfigurator.tsx, new file
- app/custom-cakes/page.tsx, new file
- app/actions/testimonials.ts, replace existing version
- supabase/migrations/0007_testimonial_avatars.sql, run in the SQL
  editor same as previous migrations, then also save the file into your
  project's migrations folder

## Testing this
1. Run the new migration in Supabase SQL editor first
2. Copy all files/folders in per the paths above
3. npm run dev
4. On /, confirm the hero shows the real cake photo with a subtle
   zoom out on load, the button is now espresso brown, and the stats
   section background matches
5. Click the "Custom Cakes" category card, confirm it lands on
   /custom-cakes with a real, working configurator (not a blank menu)
6. Add a custom cake to the cart, confirm it shows correctly in the
   drawer and at checkout
7. On /menu, click the "Custom Cakes" pill directly, confirm it also
   redirects to /custom-cakes rather than showing an empty grid
8. Confirm testimonials still show the honest empty state (expected,
   since no real reviews exist yet)
9. Run the production build and Lighthouse test described above for the
   real Performance number
