-- =========================================================
-- Reciparian Cakes — Initial Schema
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------
create type cake_finish as enum ('buttercream', 'fondant');
create type fulfillment_type as enum ('delivery', 'pickup');
create type order_status as enum (
  'pending_payment',
  'paid',
  'awaiting_dispatch',
  'ready_for_prep',
  'out_for_delivery',
  'completed',
  'cancelled',
  'expired'
);
create type user_role as enum ('customer', 'admin');

-- ---------------------------------------------------------
-- PROFILES (extends auth.users)
-- ---------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- MENU ITEMS (fixed-price products)
-- ---------------------------------------------------------
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete restrict,
  name text not null,
  description text,
  price integer not null check (price >= 0), -- kobo
  image_url text,
  dietary_tags text[] not null default '{}',
  stock_count integer, -- null = unlimited/not tracked
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index menu_items_category_id_idx on menu_items (category_id);
create index menu_items_is_available_idx on menu_items (is_available);

-- ---------------------------------------------------------
-- CUSTOM CAKE PRICING (base price per finish + size)
-- ---------------------------------------------------------
create table custom_cake_pricing (
  id uuid primary key default gen_random_uuid(),
  finish cake_finish not null,
  size_inches integer not null check (size_inches > 0),
  base_price integer not null check (base_price >= 0), -- kobo
  created_at timestamptz not null default now(),
  unique (finish, size_inches)
);

-- ---------------------------------------------------------
-- CUSTOM CAKE FLAVORS (included vs extra-cost)
-- upcharge_amount is nullable until the bakery confirms real
-- numbers — never hardcode a guessed figure (see RCEWA notes).
-- ---------------------------------------------------------
create table custom_cake_flavors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_included boolean not null default false,
  upcharge_amount integer, -- kobo, null = "confirm with bakery"
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- CUSTOM CAKE TOPPINGS / ADD-ONS (pictures, toppers, etc.)
-- ---------------------------------------------------------
create table custom_cake_addons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null check (price >= 0), -- kobo, 0 = "confirm with bakery"
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- DELIVERY ZONES (Port Harcourt, flat-rate demo fee)
-- ---------------------------------------------------------
create table delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  fee integer not null check (fee >= 0), -- kobo
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- ADDRESSES (saved addresses for authenticated customers)
-- ---------------------------------------------------------
create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  label text,
  recipient_name text not null,
  recipient_phone text not null,
  delivery_zone_id uuid references delivery_zones (id),
  street_address text not null,
  city text not null default 'Port Harcourt',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_id_idx on addresses (user_id);

-- ---------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_reference text not null unique, -- ORD_xxxxx_yyy
  user_id uuid references profiles (id) on delete set null, -- null = guest
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,

  fulfillment_type fulfillment_type not null,
  delivery_zone_id uuid references delivery_zones (id),
  delivery_address text,
  pickup_notes text,

  subtotal integer not null check (subtotal >= 0), -- kobo
  delivery_fee integer not null default 0 check (delivery_fee >= 0), -- kobo
  total integer not null check (total >= 0), -- kobo

  status order_status not null default 'pending_payment',
  paystack_reference text unique,
  paid_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on orders (user_id);
create index orders_status_idx on orders (status);
create index orders_paystack_reference_idx on orders (paystack_reference);
create index orders_created_at_idx on orders (created_at);

-- ---------------------------------------------------------
-- ORDER ITEMS
-- item_type distinguishes a catalog menu_item from a
-- configured custom cake (no fixed catalog row).
-- ---------------------------------------------------------
create type order_item_type as enum ('menu_item', 'custom_cake');

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  item_type order_item_type not null,

  menu_item_id uuid references menu_items (id),
  item_name text not null, -- snapshot, survives menu edits/deletion

  -- custom cake configuration snapshot (finish, size, flavor, addons, message)
  custom_cake_config jsonb,

  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0), -- kobo, snapshot at order time
  line_total integer not null check (line_total >= 0), -- kobo

  created_at timestamptz not null default now(),

  constraint order_items_menu_item_check
    check (
      (item_type = 'menu_item' and menu_item_id is not null)
      or (item_type = 'custom_cake' and menu_item_id is null and custom_cake_config is not null)
    )
);

create index order_items_order_id_idx on order_items (order_id);

-- ---------------------------------------------------------
-- WISHLIST
-- ---------------------------------------------------------
create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  menu_item_id uuid not null references menu_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, menu_item_id)
);

-- ---------------------------------------------------------
-- TESTIMONIALS
-- ---------------------------------------------------------
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete set null,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  message text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
