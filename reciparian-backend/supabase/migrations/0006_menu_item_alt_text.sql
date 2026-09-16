-- =========================================================
-- Add alt text support for menu item images
-- image_alt_text is separate from image_url so there's always
-- meaningful alt text (defaults to the item name) even before
-- a real photo is uploaded, and can be written with more
-- descriptive copy later without touching the image itself.
-- =========================================================

alter table menu_items
  add column image_alt_text text;

-- Backfill existing rows so nothing is ever null going forward.
update menu_items
  set image_alt_text = name
  where image_alt_text is null;

alter table menu_items
  alter column image_alt_text set default '',
  alter column image_alt_text set not null;

comment on column menu_items.image_alt_text is
  'Alt text for image_url. Falls back to the item name at insert time if not provided explicitly.';
