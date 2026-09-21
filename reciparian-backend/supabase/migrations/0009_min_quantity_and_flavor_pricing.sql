-- Minimum order quantity per menu item (1 means no minimum).
alter table menu_items
  add column if not exists min_quantity integer not null default 1 check (min_quantity >= 1);

update menu_items set min_quantity = 6
where name in ('Banana Bread', 'Cinnamon Rolls');

-- Included flavors cost nothing extra. Extra flavors stay null until the bakery
-- confirms real prices, and null means they cannot be ordered online.
update custom_cake_flavors set upcharge_amount = 0
where name in ('Vanilla', 'Red Velvet');