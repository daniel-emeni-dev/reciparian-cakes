-- Real customer reviews that were first added by hand. Avatars are uploaded
-- separately because they point at files in this project's own storage bucket.
insert into public.testimonials (customer_name, rating, message, is_published, avatar_url)
select v.customer_name, v.rating, v.message, v.is_published, v.avatar_url
from (
  values
    ('Aisha M.', 5, 'The cake was beautiful and tasted even better. Everyone asked where it was from.', true, null::text),
    ('Naya B', 5, 'Fast delivery, delicious pastries, and such a thoughtful presentation.', true, null::text)
) as v(customer_name, rating, message, is_published, avatar_url)
where not exists (
  select 1 from public.testimonials t where t.customer_name = v.customer_name
);