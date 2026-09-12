-- =========================================================
-- Reciparian Cakes — Row Level Security
-- =========================================================

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------
alter table profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on profiles for select
  using (auth.uid() = id or is_admin());

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = id);

-- ---------------------------------------------------------
-- PUBLIC CATALOG DATA (readable by anyone, written by admin only)
-- ---------------------------------------------------------
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table custom_cake_pricing enable row level security;
alter table custom_cake_flavors enable row level security;
alter table custom_cake_addons enable row level security;
alter table delivery_zones enable row level security;

create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_write" on categories for all using (is_admin()) with check (is_admin());

create policy "menu_items_public_read" on menu_items for select using (true);
create policy "menu_items_admin_write" on menu_items for all using (is_admin()) with check (is_admin());

create policy "custom_cake_pricing_public_read" on custom_cake_pricing for select using (true);
create policy "custom_cake_pricing_admin_write" on custom_cake_pricing for all using (is_admin()) with check (is_admin());

create policy "custom_cake_flavors_public_read" on custom_cake_flavors for select using (true);
create policy "custom_cake_flavors_admin_write" on custom_cake_flavors for all using (is_admin()) with check (is_admin());

create policy "custom_cake_addons_public_read" on custom_cake_addons for select using (true);
create policy "custom_cake_addons_admin_write" on custom_cake_addons for all using (is_admin()) with check (is_admin());

create policy "delivery_zones_public_read" on delivery_zones for select using (true);
create policy "delivery_zones_admin_write" on delivery_zones for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------
-- ADDRESSES (owner + admin only)
-- ---------------------------------------------------------
alter table addresses enable row level security;

create policy "addresses_owner_all"
  on addresses for all
  using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id or is_admin());

-- ---------------------------------------------------------
-- ORDERS
-- Guest checkout writes happen via the service-role client on
-- the server (bypasses RLS). These policies cover normal client
-- reads/writes for logged-in users and admins.
-- ---------------------------------------------------------
alter table orders enable row level security;

create policy "orders_owner_read"
  on orders for select
  using (auth.uid() = user_id or is_admin());

create policy "orders_owner_insert"
  on orders for insert
  with check (auth.uid() = user_id or auth.uid() is null);

create policy "orders_admin_update"
  on orders for update
  using (is_admin())
  with check (is_admin());

-- ---------------------------------------------------------
-- ORDER ITEMS
-- ---------------------------------------------------------
alter table order_items enable row level security;

create policy "order_items_owner_read"
  on order_items for select
  using (
    is_admin()
    or exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "order_items_admin_write"
  on order_items for all
  using (is_admin())
  with check (is_admin());

-- ---------------------------------------------------------
-- WISHLIST (owner only)
-- ---------------------------------------------------------
alter table wishlist_items enable row level security;

create policy "wishlist_owner_all"
  on wishlist_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- TESTIMONIALS
-- Published testimonials are public; authors can create their
-- own (pending review); admins manage everything.
-- ---------------------------------------------------------
alter table testimonials enable row level security;

create policy "testimonials_public_read_published"
  on testimonials for select
  using (is_published = true or is_admin());

create policy "testimonials_owner_insert"
  on testimonials for insert
  with check (auth.uid() = user_id);

create policy "testimonials_admin_write"
  on testimonials for update
  using (is_admin())
  with check (is_admin());
