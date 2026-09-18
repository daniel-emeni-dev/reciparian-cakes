# Home page v2 — button color, category filtering, menu fade-in, stats

## 1. Button color
The primary "Shop Fresh Pastries" button now uses a deeper, more
saturated shade of your existing Medium Pink (#FFC1D6 to #E0839E) instead
of flat black. Same color family, warmer, better contrast for white text.
Add this new token to your existing @theme block in app/globals.css (see
app/globals-token-addition.css for the exact line, don't replace the
whole file, just add this one line alongside your other brand-* tokens).

## 2. Both hero buttons going to /menu
This is staying as-is deliberately, not a bug. There's only one menu page
right now, "Shop Fresh Pastries" and "View Delivery Menu" are two framings
of the same action. Once you have a reason for them to diverge (a
dedicated delivery-only view, for instance), that's a small change, but
sending them to two different nonexistent destinations right now would be
worse than one real shared one.

## 3. Category cards now deep-link into a pre-filtered menu
- CategoryShowcase.tsx, cards now link to /menu?category=slug instead
  of a bare /menu
- InteractiveMenu.tsx, reads that ?category= param on load and starts
  pre-filtered to it. Also keeps the URL in sync as the user changes
  filters manually (shareable/bookmarkable, survives a refresh), using
  router.replace so it doesn't spam browser history with every filter
  click
- menu/page.tsx, InteractiveMenu now needs a Suspense boundary around
  it, this is a Next.js requirement whenever a component uses
  useSearchParams, not optional. A simple skeleton loader
  (MenuSkeleton) is the fallback while that resolves, which is
  effectively instant here

## 4. Menu page fade-in on load
menu/page.tsx now wraps its heading and the menu grid in the same
FadeInSection component the home page already uses, so navigating there
gets the same scroll/entry animation feel, not just the home page.

## 5. Stats section, 10 years, 50+ students trained
New StatsSection.tsx, dark background strip between the hero and
category showcase, using the AnimatedCounter component that was already
built (and unused) in the previous round. Since you confirmed both
numbers are accurate, this is now honest content, not a placeholder.
Counts from 0 on scroll into view, same as the rest of the page's fade
behavior.

## Where everything goes
- app/globals-token-addition.css, merge its one line into your existing
  @theme block in app/globals.css
- app/components/Hero.tsx, app/components/CategoryShowcase.tsx,
  app/components/InteractiveMenu.tsx, replace existing versions
- app/components/StatsSection.tsx, new file
- app/page.tsx, app/menu/page.tsx, replace existing versions

## Testing this
1. Merge the CSS token, replace/add all files listed above
2. npm run dev
3. On /, confirm the primary button is now a warm rose pink, not black
4. Scroll to the stats section, confirm both numbers count up from 0 once
   they scroll into view
5. Click a category card (e.g. "Custom Cakes"), confirm it lands on
   /menu?category=custom-cakes with that category pill already active
   and the grid pre-filtered
6. On /menu directly, confirm the heading and grid fade in on load, the
   same way sections do on the home page
7. Manually change the category filter on /menu, confirm the URL updates
   to match without a full page reload
