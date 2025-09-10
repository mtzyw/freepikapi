-- Freepik proxy service – proposed Postgres/Supabase schema
-- Focus: multi-tenant (C 站点) task brokering, webhook, retry, key rotation,
-- storage mapping (R2), and usage metrics. Adjust to Supabase migrations as needed.

-- =====================
-- Enumerations
-- =====================
DO $$ BEGIN
  CREATE TYPE task_type AS ENUM ('image','video','edit');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('PENDING','IN_PROGRESS','COMPLETED','FAILED','CANCELED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE callback_status AS ENUM ('PENDING','SENT','FAILED','GAVE_UP');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================
-- Tenancy (C sites)
-- =====================
CREATE TABLE IF NOT EXISTS sites (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text UNIQUE NOT NULL,              -- short identifier for C 站
  name          text NOT NULL,
  default_callback_url text,                       -- optional default
  webhook_secret text,                             -- for signing outbound callbacks
  rate_tier     text DEFAULT 'standard',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- =====================
-- Freepik API keys and usage
-- =====================
CREATE TABLE IF NOT EXISTS api_keys (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider     text NOT NULL DEFAULT 'freepik',
  label        text,
  key_cipher   text NOT NULL,                      -- store encrypted; app will decrypt
  key_hash     text UNIQUE NOT NULL,               -- SHA256 hash for lookup without revealing key
  daily_limit  integer DEFAULT 10000,
  active       boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Track accurate per-day usage (don’t rely on a mutable counter alone)
CREATE TABLE IF NOT EXISTS api_key_usage (
  id          bigserial PRIMARY KEY,
  api_key_id  uuid REFERENCES api_keys(id) ON DELETE CASCADE,
  day         date NOT NULL,
  used        integer NOT NULL DEFAULT 0,
  UNIQUE (api_key_id, day)
);

-- =====================
-- Task model catalog (optional but helpful)
-- =====================
CREATE TABLE IF NOT EXISTS models (
  id           serial PRIMARY KEY,
  name         text NOT NULL,                       -- e.g., 'mystic','wan-v2.2-720p','image-upscaler'
  provider     text NOT NULL DEFAULT 'freepik',     -- vendor/provider identifier
  version      text,                                -- optional provider model version string
  kind         task_type NOT NULL,                  -- image | video | edit
  operation    text NOT NULL,                       -- text_to_image | image_to_video | remove_background | upscaler | relight | expand | ...
  request_style text NOT NULL DEFAULT 'json',       -- 'json' | 'form'
  request_endpoint text NOT NULL,                   -- e.g., '/v1/ai/mystic'
  status_endpoint_template text,                    -- e.g., '/v1/ai/mystic/{task-id}'
  is_async     boolean NOT NULL DEFAULT true,
  supports_webhook boolean NOT NULL DEFAULT true,
  params_schema jsonb,                              -- JSON schema (informal) for model params
  param_defaults jsonb,                             -- default param values per model
  result_paths jsonb,                               -- e.g., {"status":"data.status","generated":"data.generated"}
  cost_credits integer,                             -- optional cost metric per request
  notes        text,
  UNIQUE (name)
);

-- Proxy access keys (for C 站访问中转站鉴权，可选使用)
CREATE TABLE IF NOT EXISTS proxy_keys (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label         text,
  token_cipher  text NOT NULL,
  token_hash    text UNIQUE NOT NULL,
  active        boolean NOT NULL DEFAULT true,
  last_used_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- =====================
-- Tasks
-- =====================
CREATE TABLE IF NOT EXISTS tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id         uuid REFERENCES sites(id) ON DELETE SET NULL,
  type            task_type NOT NULL,
  model           text,                                 -- model name, matches models.name if set
  status          task_status NOT NULL DEFAULT 'PENDING',
  idempotency_key text,                                 -- dedupe from client
  callback_url    text,                                 -- per-task override

  -- Upstream
  freepik_task_id text UNIQUE,                          -- returned by Freepik for async flows
  api_key_id      uuid REFERENCES api_keys(id) ON DELETE SET NULL,

  -- Payloads
  input_payload   jsonb NOT NULL DEFAULT '{}'::jsonb,   -- normalized input
  upstream_req    jsonb,                                -- raw payload sent to Freepik
  upstream_resp   jsonb,                                -- raw first response (with task_id)
  result_payload  jsonb,                                -- raw result/status payload

  -- Outputs
  result_urls     jsonb,                                -- array of upstream result URLs
  r2_objects      jsonb,                                -- array of {bucket,key,url,etag,size}

  -- Common, generated attributes (for filtering/indexing)
  prompt          text GENERATED ALWAYS AS ((input_payload->>'prompt')) STORED,
  image_url       text GENERATED ALWAYS AS ((input_payload->>'image_url')) STORED,
  reference_image_url text GENERATED ALWAYS AS ((input_payload->>'reference_image_url')) STORED,
  first_frame_image_url text GENERATED ALWAYS AS ((input_payload->>'first_frame_image')) STORED,
  resolution      text GENERATED ALWAYS AS ((input_payload->>'resolution')) STORED,
  aspect_ratio    text GENERATED ALWAYS AS ((input_payload->>'aspect_ratio')) STORED,
  duration_seconds integer GENERATED ALWAYS AS ((NULLIF((input_payload->>'duration'), '')::int)) STORED,
  scale_factor    numeric GENERATED ALWAYS AS ((NULLIF((input_payload->>'scale'), '')::numeric)) STORED,
  model_variant   text GENERATED ALWAYS AS ((COALESCE(input_payload->>'variant', input_payload->>'model'))) STORED,

  -- Meta
  attempts        integer NOT NULL DEFAULT 0,           -- submit attempts
  last_error      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  started_at      timestamptz,
  completed_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_tasks_site ON tasks(site_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_model ON tasks(model);
CREATE INDEX IF NOT EXISTS idx_tasks_prompt ON tasks USING gin (to_tsvector('simple', coalesce(prompt,'')));
CREATE INDEX IF NOT EXISTS idx_tasks_image_url ON tasks(image_url);
CREATE INDEX IF NOT EXISTS idx_tasks_first_frame ON tasks(first_frame_image_url);
CREATE INDEX IF NOT EXISTS idx_tasks_variant ON tasks(model_variant);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(status) WHERE status IN ('PENDING','IN_PROGRESS');

-- =====================
-- Task events (audit/log)
-- =====================
CREATE TABLE IF NOT EXISTS task_events (
  id         bigserial PRIMARY KEY,
  task_id    uuid REFERENCES tasks(id) ON DELETE CASCADE,
  kind       text NOT NULL,                  -- CREATED, SUBMITTED, WEBHOOK, POLLED, CALLBACK_OK, CALLBACK_FAIL...
  payload    jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_task_events_task ON task_events(task_id);

-- =====================
-- Inbound webhooks (from Freepik)
-- =====================
CREATE TABLE IF NOT EXISTS webhooks_inbound (
  id             bigserial PRIMARY KEY,
  source         text NOT NULL DEFAULT 'freepik',
  freepik_task_id text,
  payload        jsonb NOT NULL,
  sig_header     text,                              -- raw 'webhook-signature' header (if any)
  sig_ok         boolean,                           -- signature verification result
  secret_version text,                              -- which secret version matched
  received_at    timestamptz NOT NULL DEFAULT now(),
  processed      boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_webhooks_fp_task ON webhooks_inbound(freepik_task_id);

-- Webhook secret versions (to validate inbound signatures with rotation support)
CREATE TABLE IF NOT EXISTS webhook_secrets (
  id           bigserial PRIMARY KEY,
  provider     text NOT NULL DEFAULT 'freepik',
  version      text NOT NULL,                       -- version identifier from header
  secret_cipher text NOT NULL,                      -- store encrypted/managed
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, version)
);

-- Backfill alters for existing databases (safe-noop on fresh setups)
DO $$ BEGIN
  ALTER TABLE models ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'freepik';
  ALTER TABLE models ADD COLUMN IF NOT EXISTS version text;
  ALTER TABLE models ADD COLUMN IF NOT EXISTS request_style text NOT NULL DEFAULT 'json';
  ALTER TABLE models ADD COLUMN IF NOT EXISTS param_defaults jsonb;
  ALTER TABLE models ADD COLUMN IF NOT EXISTS result_paths jsonb;
  ALTER TABLE models ADD COLUMN IF NOT EXISTS cost_credits integer;
  ALTER TABLE models ADD COLUMN IF NOT EXISTS notes text;
  ALTER TABLE webhooks_inbound ADD COLUMN IF NOT EXISTS sig_header text;
  ALTER TABLE webhooks_inbound ADD COLUMN IF NOT EXISTS sig_ok boolean;
  ALTER TABLE webhooks_inbound ADD COLUMN IF NOT EXISTS secret_version text;
EXCEPTION WHEN others THEN NULL; END $$;

-- =====================
-- Outbound callbacks (to C 站)
-- =====================
CREATE TABLE IF NOT EXISTS callbacks (
  id             bigserial PRIMARY KEY,
  task_id        uuid REFERENCES tasks(id) ON DELETE CASCADE,
  url            text NOT NULL,
  status         callback_status NOT NULL DEFAULT 'PENDING',
  attempts       integer NOT NULL DEFAULT 0,
  last_status    integer,            -- HTTP status code
  last_response  text,               -- small excerpt of response
  next_retry_at  timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_callbacks_task ON callbacks(task_id);
CREATE INDEX IF NOT EXISTS idx_callbacks_retry ON callbacks(status, next_retry_at);

-- =====================
-- R2 assets mapped to tasks
-- =====================
CREATE TABLE IF NOT EXISTS assets (
  id            bigserial PRIMARY KEY,
  task_id       uuid REFERENCES tasks(id) ON DELETE CASCADE,
  source_url    text,                       -- Freepik temporary or CDN URL
  bucket        text,
  object_key    text,
  public_url    text,
  content_type  text,
  size_bytes    bigint,
  etag          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assets_task ON assets(task_id);
-- prevent duplicate asset rows per task/object_key
CREATE UNIQUE INDEX IF NOT EXISTS idx_assets_task_key_unique ON assets(task_id, object_key);

-- =====================
-- Scheduler state (avoid duplicate self-scheduling)
-- =====================
CREATE TABLE IF NOT EXISTS scheduler_state (
  key           text PRIMARY KEY,
  scheduled_until timestamptz
);

-- =====================
-- Per-site rate limiting windows (optional)
-- =====================
CREATE TABLE IF NOT EXISTS rate_limits (
  id           bigserial PRIMARY KEY,
  site_id      uuid REFERENCES sites(id) ON DELETE CASCADE,
  dim          text NOT NULL,                -- e.g., 'global', 'image:mystic', 'video:wan-720p'
  window_start timestamptz NOT NULL,
  window_end   timestamptz NOT NULL,
  max_requests integer NOT NULL,
  used         integer NOT NULL DEFAULT 0,
  UNIQUE (site_id, dim, window_start, window_end)
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_site_dim ON rate_limits(site_id, dim);

-- =====================
-- Idempotency keys (optional but recommended)
-- =====================
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id          bigserial PRIMARY KEY,
  site_id     uuid REFERENCES sites(id) ON DELETE CASCADE,
  key         text NOT NULL,
  task_id     uuid REFERENCES tasks(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, key)
);

-- =====================
-- Convenience views
-- =====================
CREATE OR REPLACE VIEW v_task_daily_metrics AS
SELECT
  date_trunc('day', t.created_at) AS day,
  t.site_id,
  t.type,
  t.model,
  count(*) FILTER (WHERE t.status = 'COMPLETED') AS completed,
  count(*) FILTER (WHERE t.status = 'FAILED')     AS failed,
  count(*) FILTER (WHERE t.status IN ('PENDING','IN_PROGRESS')) AS active,
  count(*) AS total
FROM tasks t
GROUP BY 1,2,3,4;
