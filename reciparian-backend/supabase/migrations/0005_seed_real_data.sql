-- =========================================================
-- Reciparian Cakes — Real Seed Data (Phase 3)
-- Sourced directly from the bakery's Care Card + pricing doc.
-- Flavor upcharges and cake add-on prices are intentionally
-- left null/empty — no real figures have been given yet.
-- =========================================================

-- ---------------------------------------------------------
-- CATEGORIES
-- Created in Phase 1's schema but never seeded — needed before
-- the menu_items inserts below, which reference these slugs.
-- ---------------------------------------------------------

insert into categories (name, slug) values
  ('Cupcakes & Pastries', 'cupcakes-pastries'),
  ('Reciparian Specials', 'reciparian-specials'),
  ('Custom Cakes', 'custom-cakes')
on conflict (slug) do nothing;

-- ---------------------------------------------------------
-- DELIVERY ZONES
-- Flat ₦3,000 (300000 kobo) across both tiers, per Daniel's
-- confirmation. zone_tier lets the UI group them separately.
-- ---------------------------------------------------------

insert into delivery_zones (name, fee, zone_tier, is_active) values
  -- Port Harcourt neighborhoods (from the original RCEWA doc)
  ('Rumuokoro', 300000, 'ph_neighborhood', true),
  ('GRA Phase 1', 300000, 'ph_neighborhood', true),
  ('GRA Phase 2', 300000, 'ph_neighborhood', true),
  ('Ada George', 300000, 'ph_neighborhood', true),
  ('Choba', 300000, 'ph_neighborhood', true),
  ('Trans Amadi', 300000, 'ph_neighborhood', true),
  ('Peter Odili', 300000, 'ph_neighborhood', true),
  ('Garrison', 300000, 'ph_neighborhood', true),
  ('Elelenwo', 300000, 'ph_neighborhood', true),
  ('Mile 1-3', 300000, 'ph_neighborhood', true),

  -- Rivers State Local Government Areas
  ('Abua/Odual', 300000, 'lga', true),
  ('Ahoada East', 300000, 'lga', true),
  ('Ahoada West', 300000, 'lga', true),
  ('Akuku-Toru', 300000, 'lga', true),
  ('Andoni', 300000, 'lga', true),
  ('Asari-Toru', 300000, 'lga', true),
  ('Bonny', 300000, 'lga', true),
  ('Degema', 300000, 'lga', true),
  ('Eleme', 300000, 'lga', true),
  ('Emohua', 300000, 'lga', true),
  ('Etche', 300000, 'lga', true),
  ('Gokana', 300000, 'lga', true),
  ('Ikwerre', 300000, 'lga', true),
  ('Khana', 300000, 'lga', true),
  ('Obio/Akpor', 300000, 'lga', true),
  ('Ogba/Egbema/Ndoni', 300000, 'lga', true),
  ('Ogu/Bolo', 300000, 'lga', true),
  ('Okrika', 300000, 'lga', true),
  ('Omuma', 300000, 'lga', true),
  ('Opobo/Nkoro', 300000, 'lga', true),
  ('Oyigbo', 300000, 'lga', true),
  ('Port Harcourt', 300000, 'lga', true),
  ('Tai', 300000, 'lga', true);

-- ---------------------------------------------------------
-- CUSTOM CAKE PRICING
-- Confirmed real prices from the bakery's current price list
-- (kobo = naira x 100).
-- ---------------------------------------------------------

insert into custom_cake_pricing (finish, size_inches, base_price) values
  ('buttercream', 7,  4000000),
  ('buttercream', 8,  6000000),
  ('buttercream', 10, 8500000),
  ('buttercream', 12, 12000000),
  ('buttercream', 14, 16500000),
  ('buttercream', 16, 25000000),
  ('fondant', 7,  5500000),
  ('fondant', 8,  7500000),
  ('fondant', 10, 11000000),
  ('fondant', 12, 16500000),
  ('fondant', 14, 21000000),
  ('fondant', 16, 30000000)
on conflict (finish, size_inches) do update
  set base_price = excluded.base_price;

-- ---------------------------------------------------------
-- CUSTOM CAKE FLAVORS
-- Vanilla and Red Velvet are included in the base price.
-- The rest attract extra cost — no fixed amount confirmed by
-- the bakery yet, so upcharge_amount stays null intentionally.
-- Do NOT fill these with a guessed number.
-- ---------------------------------------------------------

insert into custom_cake_flavors (name, is_included, upcharge_amount, is_available) values
  ('Vanilla', true, null, true),
  ('Red Velvet', true, null, true),
  ('Strawberry', false, null, true),
  ('Coconut', false, null, true),
  ('Chocolate', false, null, true),
  ('Cookies and Cream', false, null, true),
  ('Mixed Fruit', false, null, true),
  ('Lemon', false, null, true),
  ('Banana', false, null, true),
  ('Coffee', false, null, true)
on conflict (name) do nothing;

-- ---------------------------------------------------------
-- CUSTOM CAKE ADD-ONS
-- Pictures, toppers, toppings, multi-flavor combos all cost
-- more per the Care Card, but no fixed prices exist yet.
-- Intentionally left empty rather than guessed — populate
-- once the bakery confirms real numbers.
-- ---------------------------------------------------------

-- (no rows inserted — see note above)

-- ---------------------------------------------------------
-- MENU ITEMS
-- Cupcakes & Pastries, Reciparian Specials — real prices from
-- the Care Card pricing sheet (kobo = naira x 100).
-- ---------------------------------------------------------

insert into menu_items (name, description, price, dietary_tags, is_available, category_id)
values
  ('Box of 6 Cupcakes',
   'One flavor with a simple design. Multiple flavors limited to two, cost more depending on the flavors. Additions like pictures, toppers, toppings etc cost more.',
   1500000, '{}', true,
   (select id from categories where slug = 'cupcakes-pastries')),

  ('Box of 12 Cupcakes',
   'One flavor with a simple design. Multiple flavors limited to two, cost more depending on the flavors. Additions like pictures, toppers, toppings etc cost more.',
   3000000, '{}', true,
   (select id from categories where slug = 'cupcakes-pastries')),

  ('Meatpies/Chicken Pie',
   'Box of 6.',
   1800000, '{}', true,
   (select id from categories where slug = 'cupcakes-pastries')),

  ('Sausage Rolls',
   'Box of 6.',
   1500000, '{}', true,
   (select id from categories where slug = 'cupcakes-pastries')),

  ('Doughnuts (Glazed)',
   'Box of 6 glazed doughnuts.',
   1300000, '{}', true,
   (select id from categories where slug = 'cupcakes-pastries')),

  ('Doughnuts (Jam Filled)',
   'Box of 6 jam filled doughnuts.',
   1800000, '{}', true,
   (select id from categories where slug = 'cupcakes-pastries')),

  ('Banana Bread',
   'Sold per loaf, minimum order of 6.',
   200000, '{}', true,
   (select id from categories where slug = 'cupcakes-pastries')),

  ('Banana Bread (Mini Loaf)',
   'Single mini loaf.',
   1200000, '{}', true,
   (select id from categories where slug = 'cupcakes-pastries')),

  ('Egg Rolls',
   'Box of 12.',
   2500000, '{}', true,
   (select id from categories where slug = 'cupcakes-pastries'));

insert into menu_items (name, description, price, dietary_tags, is_available, category_id)
values
  ('Reciparian Jay Package',
   '6 inches in diameter, 2 inches high cake, plus 6 cupcakes. Add pictures for ₦33,000.',
   3000000, '{}', true,
   (select id from categories where slug = 'reciparian-specials')),

  ('Reciparian Bento Cake',
   '6 inches in diameter, 3 inches high, Vanilla cake.',
   3000000, '{}', true,
   (select id from categories where slug = 'reciparian-specials')),

  ('Brownies (Slice)',
   'Single slice.',
   300000, '{}', true,
   (select id from categories where slug = 'reciparian-specials')),

  ('Brownies (Box of 9)',
   'Box of 9 brownies.',
   3300000, '{}', true,
   (select id from categories where slug = 'reciparian-specials')),

  ('Brownies (Box of 12)',
   'Box of 12 brownies.',
   4000000, '{}', true,
   (select id from categories where slug = 'reciparian-specials')),

  ('Cinnamon Rolls',
   'Sold per roll, minimum order of 6.',
   150000, '{}', true,
   (select id from categories where slug = 'reciparian-specials')),

  ('Cinnamon Rolls (Box of 9)',
   'Box of 9.',
   1500000, '{}', true,
   (select id from categories where slug = 'reciparian-specials')),

  ('Cinnamon Rolls (Box of 9, with Cream)',
   'Box of 9, finished with cream.',
   1800000, '{}', true,
   (select id from categories where slug = 'reciparian-specials')),

  ('Un-iced Cake (Full)',
   'Full un-iced cake.',
   450000, '{}', true,
   (select id from categories where slug = 'reciparian-specials')),

  ('Un-iced Cake (Loaf)',
   'Loaf sized un-iced cake.',
   1500000, '{}', true,
   (select id from categories where slug = 'reciparian-specials'));
