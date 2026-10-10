-- Catch up migration: objects that were created by hand in the dashboard.
-- Safe to run on a database that already has them.

-- Admin "show greyed out when sold out" switch
alter table public.menu_items
  add column if not exists show_when_sold_out boolean not null default false;

-- Wishlist
create table if not exists public.wishlist_items (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  menu_item_id uuid not null,
  created_at timestamptz not null default now(),
  constraint wishlist_items_pkey primary key (id),
  constraint wishlist_items_user_id_fkey
    foreign key (user_id) references public.profiles (id) on delete cascade,
  constraint wishlist_items_menu_item_id_fkey
    foreign key (menu_item_id) references public.menu_items (id) on delete cascade,
  constraint wishlist_items_user_id_menu_item_id_key unique (user_id, menu_item_id)
);

-- The current database has a second, identical unique index by accident.
drop index if exists public.wishlist_items_user_menu_item_key;

alter table public.wishlist_items enable row level security;

drop policy if exists wishlist_owner_all on public.wishlist_items;
create policy wishlist_owner_all
  on public.wishlist_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Product photo bucket. The limits live here too, because 0014 only updates
-- a bucket that already exists, so on a fresh project it changes nothing.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-images', 'menu-images', true, 3145728, array['image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 3145728,
      allowed_mime_types = array['image/webp'];