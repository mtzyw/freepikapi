import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Server-side admin client. Requires service role key.
export const supabaseAdmin = (() => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    // Defer throwing until actually used, to keep mock/local flows working
    return null as any;
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
})();

export function assertSupabase() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase env not configured: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return supabaseAdmin as ReturnType<typeof createClient>;
}

