-- Expires abandoned checkouts: orders still pending_payment after 30 minutes.
-- Called by /api/orders/expire using the service role only.
create or replace function expire_stale_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare expired_count integer;
begin
  update orders
  set status = 'expired'
  where status = 'pending_payment'
    and created_at < now() - interval '30 minutes';

  get diagnostics expired_count = row_count;
  return expired_count;
end;
$$;

-- Postgres lets everyone run functions by default, so lock it down.
revoke execute on function expire_stale_orders() from public, anon, authenticated;
grant execute on function expire_stale_orders() to service_role;