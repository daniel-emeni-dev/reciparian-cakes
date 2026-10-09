-- Testimonials: customers can only submit unpublished ones
drop policy if exists testimonials_owner_insert on public.testimonials;
create policy testimonials_owner_insert
  on public.testimonials
  for insert
  to authenticated
  with check (auth.uid() = user_id and is_published = false);

-- Profiles: a self inserted profile can only ever be a customer
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id and role = 'customer');

-- Logged out visitors never need to write profiles
revoke insert, update on public.profiles from anon;