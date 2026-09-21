-- =========================================================
-- Add avatar support to testimonials
-- Nullable — falls back to initials in the UI when no photo
-- has been uploaded yet.
-- =========================================================

alter table testimonials
  add column avatar_url text;

comment on column testimonials.avatar_url is
  'Public URL of the reviewer''s photo, uploaded via the same /api/upload route used for menu items. Null shows an initials avatar instead.';
