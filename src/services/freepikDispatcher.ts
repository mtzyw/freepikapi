import { env } from "@/lib/env";
import { assertSupabase } from "@/lib/supabase";

type DispatchInput = {
  modelName: string;
  webhookUrl?: string;
  apiKey: string;
  payload: Record<string, any>;
};

type DispatchResult = { task_id?: string; status?: string; data?: any };

async function postJson(endpoint: string, body: any, apiKey: string) {
  const url = `${env.FREEPIK_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-freepik-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Freepik POST ${endpoint} failed: ${res.status}`);
  const data = await res.json().catch(() => ({}));
  return data;
}

async function postForm(endpoint: string, form: FormData, apiKey: string) {
  const url = `${env.FREEPIK_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "x-freepik-api-key": apiKey,
    },
    body: form,
  });
  if (!res.ok) throw new Error(`Freepik POST(form) ${endpoint} failed: ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await res.json();
  const blob = await res.blob();
  return { data: { blob } };
}

export async function dispatchFreepikTask(input: DispatchInput): Promise<DispatchResult> {
  if (env.MOCK_FREEPIK) {
    return { task_id: `fp_${Math.random().toString(36).slice(2)}`, status: "IN_PROGRESS" };
  }
  const supabase = assertSupabase();
  const { data: model, error } = await (supabase as any)
    .from("models")
    .select("name, kind, operation, request_style, request_endpoint, status_endpoint_template, is_async, supports_webhook")
    .eq("name", input.modelName)
    .maybeSingle();
  if (error) throw error;
  if (!model) throw new Error(`Unknown model: ${input.modelName}`);

  const requestStyle = (model.request_style as string) || "json";
  const body = { ...(input.payload || {}) } as Record<string, any>;

  // For async endpoints, add webhook if supported
  if (model.is_async && model.supports_webhook && input.webhookUrl) {
    body["webhook_url"] = input.webhookUrl;
  }

  // Decide JSON vs Form by model.request_style
  if (requestStyle === "form") {
    const form = new FormData();
    for (const [k, v] of Object.entries(body)) {
      if (v === undefined || v === null) continue;
      // Convert primitives to strings; blobs/buffers unsupported here
      form.set(k, typeof v === "string" ? v : String(v));
    }
    const data = await postForm(model.request_endpoint, form, input.apiKey);
    const resp = data as any;
    return { status: resp?.status || resp?.data?.status || "IN_PROGRESS", data: resp };
  }

  // Default JSON POST
  const data = await postJson(model.request_endpoint, body, input.apiKey);
  const task_id = data?.data?.task_id ?? data?.task_id;
  const status = data?.data?.status ?? data?.status;
  return { task_id, status, data };
}

export async function getStatusForModel(modelName: string, taskId: string, apiKey: string) {
  if (env.MOCK_FREEPIK) {
    return { status: "COMPLETED", generated: ["https://example.com/mock.jpg"] };
  }
  const supabase = assertSupabase();
  const { data: model, error } = await (supabase as any)
    .from("models")
    .select("status_endpoint_template")
    .eq("name", modelName)
    .maybeSingle();
  if (error) throw error;
  const template = model?.status_endpoint_template as string | null;
  if (!template) throw new Error(`Model ${modelName} has no status endpoint template`);
  const endpoint = template.replace("{task-id}", taskId);
  const url = `${env.FREEPIK_BASE_URL}${endpoint}`;
  const res = await fetch(url, { headers: { "x-freepik-api-key": apiKey } });
  if (!res.ok) throw new Error(`Freepik GET ${endpoint} failed: ${res.status}`);
  const data = await res.json();
  return { status: data?.data?.status ?? data?.status, generated: data?.data?.generated ?? data?.generated };
}
