-- =========================================================
-- Add zone tiering to delivery_zones
-- Lets the checkout UI group Port Harcourt neighborhoods
-- separately from the broader Rivers State LGA list, while
-- keeping a single flat table and a single fee column.
-- =========================================================

create type delivery_zone_tier as enum ('ph_neighborhood', 'lga');

alter table delivery_zones
  add column zone_tier delivery_zone_tier not null default 'lga';

comment on column delivery_zones.zone_tier is
  'ph_neighborhood = specific Port Harcourt area (Rumuokoro, GRA, etc). lga = Rivers State local government area.';
