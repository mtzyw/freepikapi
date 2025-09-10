export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  // Optional explicit webhook base or full URL; if set, takes precedence
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  // Optional project secret; add as needed
  FREEPIK_API_KEY: process.env.FREEPIK_API_KEY,
  FREEPIK_BASE_URL: process.env.FREEPIK_BASE_URL || "https://api.freepik.com",
  MOCK_FREEPIK: process.env.MOCK_FREEPIK === "1" || process.env.MOCK_FREEPIK === "true",
  // Supabase (server-side)
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  // Direct Postgres (optional)
  DATABASE_URL: process.env.DATABASE_URL,
  // Cloudflare R2 (S3-compatible)
  R2_ENDPOINT: process.env.R2_ENDPOINT,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET: process.env.R2_BUCKET,
  R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL, // optional: e.g., https://cdn.example.com or https://<account>.r2.dev/<bucket>
  R2_UPLOAD_PROGRESS_LOG: process.env.R2_UPLOAD_PROGRESS_LOG === "1" || process.env.R2_UPLOAD_PROGRESS_LOG === "true",
  R2_UPLOAD_PART_SIZE_MB: Number(process.env.R2_UPLOAD_PART_SIZE_MB || 8),
  // Upstash QStash (optional for scheduled polling)
  QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
  QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
  QSTASH_URL: process.env.QSTASH_URL || process.env.STASH_URL || "https://qstash.upstash.io",
  QSTASH_TOKEN: process.env.QSTASH_TOKEN,
  // Internal submit auth (for local fire-and-forget fallback)
  ADMIN_SUBMIT_TOKEN: process.env.ADMIN_SUBMIT_TOKEN,
  // Tunables (with sensible defaults)
  FINALIZE_LOCK_TTL_SECONDS: Number(process.env.FINALIZE_LOCK_TTL_SECONDS || 600), // 10 minutes
  CALLBACK_TIMEOUT_MS: Number(process.env.CALLBACK_TIMEOUT_MS || 10_000),
  TASK_POLL_FIRST_DELAY_SECONDS: Number(process.env.TASK_POLL_FIRST_DELAY_SECONDS || 120),
  POLL_MIN_FIRST_IMAGE_SECONDS: Number(process.env.POLL_MIN_FIRST_IMAGE_SECONDS || 60),
  POLL_MIN_FIRST_VIDEO_SECONDS: Number(process.env.POLL_MIN_FIRST_VIDEO_SECONDS || 120),
  TASK_POLL_TIMEOUT_SECONDS: Number(process.env.TASK_POLL_TIMEOUT_SECONDS || 300),
  GLOBAL_POLL_MIN_FIRST_SECONDS: Number(process.env.GLOBAL_POLL_MIN_FIRST_SECONDS || 60),
  GLOBAL_POLL_TIMEOUT_SECONDS: Number(process.env.GLOBAL_POLL_TIMEOUT_SECONDS || 240),
};

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}
