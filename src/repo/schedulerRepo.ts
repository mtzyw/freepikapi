import { assertSupabase } from "@/lib/supabase";

export async function repoTryScheduleOnce(key: string, scheduleAtISO: string): Promise<boolean> {
  const supabase = assertSupabase();
  // Read current state
  const { data: row, error: e1 } = await (supabase as any)
    .from("scheduler_state")
    .select("key, scheduled_until")
    .eq("key", key)
    .maybeSingle();
  if (e1) throw e1;
  const now = Date.now();
  const existsFuture = row?.scheduled_until ? Date.parse(row.scheduled_until) > now : false;
  if (existsFuture) return false; // already scheduled ahead

  const payload = { key, scheduled_until: scheduleAtISO } as any;
  const { error: e2 } = await (supabase as any).from("scheduler_state").upsert(payload, { onConflict: "key" });
  if (e2) throw e2;
  return true;
}

