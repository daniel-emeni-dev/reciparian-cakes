-- =========================================================
-- Reciparian Cakes — Functions & Triggers
-- =========================================================

-- ---------------------------------------------------------
-- updated_at auto-touch
-- ---------------------------------------------------------
create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on profiles
  for each row execute function touch_updated_at();

create trigger menu_items_touch_updated_at
  before update on menu_items
  for each row execute function touch_updated_at();

create trigger orders_touch_updated_at
  before update on orders
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up
-- ---------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------
-- Expire stale pending_payment orders (older than 30 minutes)
-- Called from a scheduled job (e.g. Vercel Cron hitting
-- /api/orders/expire) or pg_cron if enabled on the project.
-- ---------------------------------------------------------
create or replace function expire_stale_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_count integer;
begin
  with updated as (
    update orders
    set status = 'expired'
    where status = 'pending_payment'
      and created_at < now() - interval '30 minutes'
    returning id
  )
  select count(*) into expired_count from updated;

  return expired_count;
end;
$$;
