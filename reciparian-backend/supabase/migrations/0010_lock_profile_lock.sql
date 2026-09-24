revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

select
  has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE') as can_change_role,
  has_column_privilege('authenticated', 'public.profiles', 'full_name', 'UPDATE') as can_change_name;