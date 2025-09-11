import { assertSupabase } from "@/lib/supabase";
import { Task, TaskStatus, TaskType } from "@/lib/types";

async function sha256Hex(input: string): Promise<string> {
  // Prefer Node's crypto if available
  try {
    const nodeCrypto = await import("node:crypto");
    if (typeof nodeCrypto.createHash === "function") {
      return nodeCrypto.createHash("sha256").update(input).digest("hex");
    }
    // Node webcrypto
    const subtle = (nodeCrypto as any)?.webcrypto?.subtle;
    if (subtle) {
      const buf = await subtle.digest("SHA-256", new TextEncoder().encode(input));
      const bytes = new Uint8Array(buf as ArrayBuffer);
      return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {}
  // Edge/Browser runtime global webcrypto
  try {
    // @ts-ignore
    const subtle = (globalThis.crypto && (globalThis.crypto as any).subtle) || null;
    if (subtle) {
      const buf = await subtle.digest("SHA-256", new TextEncoder().encode(input));
      const bytes = new Uint8Array(buf as ArrayBuffer);
      return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {}
  throw new Error("SHA-256 not available in this runtime");
}

function todayISODate() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export async function repoSelectApiKey(): Promise<{ apiKeyId: string; apiKeyCipher: string } | null> {
  const supabase = assertSupabase();
  // Find active keys with usage under limit today, order by used asc
  const { data: keys, error: e1 } = await (supabase as any)
    .from("api_keys")
    .select("id, key_cipher, daily_limit")
    .eq("active", true);
  if (e1) throw e1;
  if (!keys || keys.length === 0) return null;

  const day = todayISODate();
  // Load usage for candidate keys
  const { data: usage, error: e2 } = await (supabase as any)
    .from("api_key_usage")
    .select("api_key_id, used")
    .in("api_key_id", ((keys || []) as Array<{ id: string }>).map((k) => k.id))
    .eq("day", day);
  if (e2) throw e2;
  const usedMap = new Map<string, number>((usage || []).map((u: any) => [u.api_key_id, u.used]));
  const keysTyped = (keys || []) as Array<{ id: string; key_cipher: string; daily_limit?: number }>;
  const pick = [...keysTyped]
    .map((k) => ({ id: k.id, key_cipher: k.key_cipher, limit: k.daily_limit ?? 10000, used: usedMap.get(k.id) ?? 0 }))
    .sort((a, b) => a.used - b.used)
    .find((k) => k.used < k.limit) || null;
  if (!pick) return null;

  // Upsert usage +1 (best effort; fine for initial version)
  const { error: e3 } = await (supabase as any).from("api_key_usage").upsert(
    { api_key_id: pick.id, day, used: pick.used + 1 },
    { onConflict: "api_key_id,day" }
  );
  if (e3) throw e3;

  // Touch last_used_at for visibility/metrics
  const { error: e4 } = await (supabase as any)
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", pick.id);
  if (e4) throw e4;
  return { apiKeyId: pick.id, apiKeyCipher: pick.key_cipher };
}

export async function repoCreateTask(input: {
  siteId?: string;
  type: TaskType;
  model?: string;
  callbackUrl?: string;
  inputPayload: Record<string, unknown>;
  upstreamReq?: any;
  freepikTaskId?: string;
  apiKeyId?: string;
  status?: TaskStatus;
}): Promise<Task & { id: string }> {
  const supabase = assertSupabase();
  const { data, error } = await (supabase as any)
    .from("tasks")
    .insert({
      site_id: input.siteId ?? null,
      type: input.type,
      model: input.model ?? null,
      status: input.status ?? (input.freepikTaskId ? "IN_PROGRESS" : "PENDING"),
      callback_url: input.callbackUrl ?? null,
      freepik_task_id: input.freepikTaskId ?? null,
      api_key_id: input.apiKeyId ?? null,
      input_payload: input.inputPayload ?? {},
      upstream_req: input.upstreamReq ?? null,
      started_at: input.freepikTaskId ? new Date().toISOString() : null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as any;
}

export async function repoUpdateTask(id: string, patch: Partial<{
  status: TaskStatus;
  freepikTaskId: string;
  upstreamResp: any;
  resultPayload: any;
  resultUrls: string[];
  r2Objects: any[];
  error: string | null;
  apiKeyId: string;
}>): Promise<void> {
  const supabase = assertSupabase();
  const update: Record<string, any> = {};
  if (patch.status) update.status = patch.status;
  if (patch.freepikTaskId) update.freepik_task_id = patch.freepikTaskId;
  if (patch.upstreamResp) update.upstream_resp = patch.upstreamResp;
  if (patch.resultPayload) update.result_payload = patch.resultPayload;
  if (patch.resultUrls) update.result_urls = patch.resultUrls;
  if (patch.r2Objects) update.r2_objects = patch.r2Objects;
  if (patch.error !== undefined) update.last_error = patch.error;
  if (patch.apiKeyId) update.api_key_id = patch.apiKeyId;
  // Auto-manage timestamps for lifecycle transitions
  if (patch.status === "IN_PROGRESS") {
    update.started_at = new Date().toISOString();
  }
  if (patch.status === "COMPLETED" || patch.status === "FAILED" || patch.status === "CANCELED") {
    update.completed_at = new Date().toISOString();
  }
  const { error } = await (supabase as any).from("tasks").update(update).eq("id", id);
  if (error) throw error;
}

export async function repoGetTaskByFreepikTaskId(fpTaskId: string) {
  const supabase = assertSupabase();
  const { data, error } = await (supabase as any).from("tasks").select("*").eq("freepik_task_id", fpTaskId).maybeSingle();
  if (error) throw error;
  return data as any | null;
}

export async function repoListInProgressTasks(limit = 100) {
  const supabase = assertSupabase();
  const { data, error } = await (supabase as any)
    .from("tasks")
    .select("id, freepik_task_id, api_key_id, status, model, started_at, created_at")
    .eq("status", "IN_PROGRESS")
    .not("freepik_task_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data || []) as Array<{
    id: string;
    freepik_task_id: string;
    api_key_id: string | null;
    status: TaskStatus;
    model: string | null;
    started_at: string | null;
    created_at: string;
  }>;
}

export async function repoGetApiKeyCipherById(id: string): Promise<string | null> {
  const supabase = assertSupabase();
  const { data, error } = await (supabase as any)
    .from("api_keys")
    .select("key_cipher")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data?.key_cipher as string) ?? null;
}

export async function repoGetTaskBasicById(id: string): Promise<{ id: string; callback_url: string | null; freepik_task_id: string | null } | null> {
  const supabase = assertSupabase();
  const { data, error } = await (supabase as any)
    .from("tasks")
    .select("id, callback_url, freepik_task_id")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return data as any;
}

export async function repoGetTaskForFinalize(id: string): Promise<{
  id: string;
  status: TaskStatus;
  callback_url: string | null;
  freepik_task_id: string | null;
  r2_objects: any[] | null;
  completed_at: string | null;
  result_payload: any | null;
} | null> {
  const supabase = assertSupabase();
  const { data, error } = await (supabase as any)
    .from("tasks")
    .select("id, status, callback_url, freepik_task_id, r2_objects, completed_at, result_payload")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as any) ?? null;
}

export async function repoGetTaskForSubmit(id: string): Promise<{
  id: string;
  type: TaskType;
  model: string | null;
  callback_url: string | null;
  input_payload: Record<string, unknown>;
  api_key_id: string | null;
  freepik_task_id: string | null;
  status: TaskStatus;
  created_at: string;
  started_at: string | null;
} | null> {
  const supabase = assertSupabase();
  const { data, error } = await (supabase as any)
    .from("tasks")
    .select("id, type, model, callback_url, input_payload, api_key_id, freepik_task_id, status, created_at, started_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as any) ?? null;
}

export async function repoInsertInboundWebhook(input: {
  freepikTaskId?: string | null;
  payload: any;
  sigHeader?: string | null;
  sigOk?: boolean | null;
  secretVersion?: string | null;
}): Promise<void> {
  const supabase = assertSupabase();
  const row = {
    source: 'freepik',
    freepik_task_id: input.freepikTaskId ?? null,
    payload: input.payload ?? {},
    sig_header: input.sigHeader ?? null,
    sig_ok: input.sigOk ?? null,
    secret_version: input.secretVersion ?? null,
  } as any;
  const { error } = await (supabase as any).from('webhooks_inbound').insert(row);
  if (error) throw error;
}

export async function repoVerifyProxyKey(tokenCipher: string): Promise<{ id: string } | null> {
  const supabase = assertSupabase();
  const hashHex = await sha256Hex(tokenCipher);
  const { data, error } = await (supabase as any)
    .from("proxy_keys")
    .select("id, active")
    .eq("token_hash", hashHex)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.active !== true) return null;
  // Touch last_used_at (best-effort)
  await (supabase as any).from("proxy_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return { id: data.id };
}

export async function repoFindProxyKeyMetaByToken(tokenCipher: string): Promise<{
  id: string;
  active: boolean;
  default_callback_url: string | null;
  site_id: string | null;
} | null> {
  const supabase = assertSupabase();
  const hashHex = await sha256Hex(tokenCipher);
  try {
    const { data, error } = await (supabase as any)
      .from("proxy_keys")
      .select("id, active, default_callback_url, site_id")
      .eq("token_hash", hashHex)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return data as any;
  } catch (e) {
    // Backward compatible: older DBs without default_callback_url/site_id
    const { data, error } = await (supabase as any)
      .from("proxy_keys")
      .select("id, active")
      .eq("token_hash", hashHex)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { id: data.id, active: data.active, default_callback_url: null, site_id: null } as any;
  }
}

export async function repoGetModelByRequestEndpoint(endpoint: string): Promise<
  | {
      name: string;
      kind: string;
      request_endpoint: string;
      status_endpoint_template: string | null;
      is_async: boolean;
      supports_webhook: boolean;
    }
  | null
> {
  const supabase = assertSupabase();
  const { data, error } = await (supabase as any)
    .from("models")
    .select("name, kind, request_endpoint, status_endpoint_template, is_async, supports_webhook")
    .eq("request_endpoint", endpoint)
    .maybeSingle();
  if (error) throw error;
  return (data as any) ?? null;
}
