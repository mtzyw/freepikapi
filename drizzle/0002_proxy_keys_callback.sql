-- Add default_callback_url and optional site_id to proxy_keys
ALTER TABLE proxy_keys
  ADD COLUMN IF NOT EXISTS default_callback_url text;

ALTER TABLE proxy_keys
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id) ON DELETE SET NULL;

