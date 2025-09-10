import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { repoCreateTask, repoFindProxyKeyMetaByToken, repoGetModelByRequestEndpoint, repoSelectApiKey } from "@/repo/supabaseRepo";
import { qstashScheduleTaskPoll } from "@/lib/qstash";
import { base64urlEncode, hmacSHA256Hex } from "@/lib/sign";

export const runtime = "nodejs";

let rrIndex = 0;
function pickUpstreamKeyFromEnv(): { apiKeyCipher: string; apiKeyId: string } | null {
  const keys = env.FREEPIK_API_KEYS;
  if (!keys || keys.length === 0) return null;
  const idx = rrIndex++ % keys.length;
  const key = keys[idx];
  // synthesize an id using index; only used for logging
  return { apiKeyCipher: key, apiKeyId: `env:${idx}` };
}

function baseWebhookUrl(): string {
  const cfg = env.WEBHOOK_URL?.trim();
  if (!cfg) return `${env.NEXT_PUBLIC_SITE_URL}/api/webhook/freepik`;
  try {
    const u = new URL(cfg);
    if (u.pathname.includes("/api/webhook/freepik")) return cfg.replace(/\/$/, "");
    const base = cfg.replace(/\/$/, "");
    return `${base}/api/webhook/freepik`;
  } catch {
    return `${env.NEXT_PUBLIC_SITE_URL}/api/webhook/freepik`;
  }
}

function isJson(headers: Headers) {
  const ct = headers.get("content-type") || headers.get("Content-Type") || "";
  return ct.includes("application/json");
}

function buildTargetUrl(req: NextRequest, pathParts: string[]) {
  const base = (env.FREEPIK_BASE_URL || "https://api.freepik.com").replace(/\/$/, "");
  const tail = pathParts.join("/");
  const url = new URL(req.url);
  const qs = url.search || "";
  return `${base}/v1/${tail}${qs}`;
}

function buildUpstreamHeaders(req: NextRequest, upstreamKey: string): Headers {
  const headers = new Headers();
  for (const [k, v] of req.headers.entries()) {
    const key = k.toLowerCase();
    // drop hop-by-hop / unsafe / auth headers
    if (["host", "connection", "content-length", "accept-encoding", "x-forwarded-for", "x-real-ip"].includes(key)) continue;
    if (key === "x-freepik-api-key") continue; // don't leak proxy token upstream
    if (key === "authorization") continue; // avoid confusion
    if (key === "x-callback-url") continue; // internal only
    headers.set(k, v);
  }
  headers.set("x-freepik-api-key", upstreamKey);
  return headers;
}

function stripEncodingHeaders(src: Headers): Headers {
  const h = new Headers();
  for (const [k, v] of src.entries()) {
    const key = k.toLowerCase();
    if (key === 'content-encoding') continue;
    if (key === 'transfer-encoding') continue;
    if (key === 'content-length') continue;
    h.set(k, v);
  }
  return h;
}

async function maybeInjectWebhook(bodyText: string, ctx: { callback_url?: string | null } | null): Promise<string> {
  if (env.PROXY_WEBHOOK_MODE === "off") return bodyText;
  const baseUrl = baseWebhookUrl();
  try {
    const obj = bodyText ? JSON.parse(bodyText) : {};
    let url = baseUrl;
    if (env.PROXY_STATELESS && ctx && env.WEBHOOK_TOKEN_SECRET) {
      const ctxPayload = base64urlEncode(JSON.stringify({ callback_url: ctx.callback_url || null, ts: Date.now() }));
      const sig = hmacSHA256Hex(env.WEBHOOK_TOKEN_SECRET, ctxPayload);
      const u = new URL(baseUrl);
      u.searchParams.set("ctx", ctxPayload);
      u.searchParams.set("sig", sig);
      url = u.toString();
    }
    if (env.PROXY_WEBHOOK_MODE === "force_override") {
      obj.webhook_url = url;
      return JSON.stringify(obj);
    }
    if (env.PROXY_WEBHOOK_MODE === "inject_if_missing" && obj.webhook_url == null) {
      obj.webhook_url = url;
      return JSON.stringify(obj);
    }
    return bodyText;
  } catch {
    return bodyText; // non-JSON or invalid JSON; leave as-is
  }
}

function inferTypeFromPath(tail: string): "image" | "video" | "edit" {
  const p = tail.toLowerCase();
  if (p.includes("image-to-video") || p.includes("video")) return "video";
  if (p.includes("image") && !p.includes("edit")) return "image";
  return "edit";
}

async function createTaskSnapshot(params: {
  tailPath: string;
  proxyKeyMeta: { id: string; default_callback_url: string | null; site_id: string | null };
  upstreamApiKeyId: string;
  respJson: any;
  reqJson?: any;
}) {
  const { tailPath, proxyKeyMeta, upstreamApiKeyId, respJson, reqJson } = params;
  const task_id = respJson?.data?.task_id ?? respJson?.task_id;
  const status = (respJson?.data?.status ?? respJson?.status ?? "IN_PROGRESS").toString().toUpperCase();
  if (!task_id) return null;

  const endpoint = `/v1/${tailPath}`;
  const model = await repoGetModelByRequestEndpoint(endpoint);
  const type = (model?.kind as any) || inferTypeFromPath(tailPath);
  // 优先使用 data 中的 webhook_url（由 C站提供作为回调地址）；若没有则回退到 proxy_key 默认值
  const callbackFromData = (reqJson?.webhook_url as string | undefined)
    || (reqJson?.callback_url as string | undefined)
    || undefined;
  const callbackUrl = callbackFromData || proxyKeyMeta.default_callback_url || null;

  try {
    const created = await repoCreateTask({
      siteId: proxyKeyMeta.site_id || undefined,
      type,
      model: model?.name || null as any,
      callbackUrl: callbackUrl || undefined,
      inputPayload: (reqJson && typeof reqJson === 'object') ? { ...reqJson, _proxy_entry: endpoint } : { _proxy_entry: endpoint },
      upstreamReq: (reqJson && typeof reqJson === 'object') ? reqJson : null,
      freepikTaskId: task_id,
      apiKeyId: upstreamApiKeyId,
      status: status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
    });
    return { id: created.id, modelName: model?.name || null };
  } catch (e) {
    logger.warn("proxy.task_create_failed", { endpoint, error: String((e as any)?.message || e) });
    return null;
  }
}

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: pathPartsRaw } = await ctx.params;
  const pathParts = pathPartsRaw || [];
  const tailPath = pathParts.join("/");

  // 1) Authenticate client via proxy key (using Freepik header name for compatibility)
  const proxyToken = req.headers.get("x-freepik-api-key") || req.headers.get("X-Freepik-Api-Key");
  if (!proxyToken) {
    return NextResponse.json({ error: "missing_proxy_key" }, { status: 401 });
  }
  const proxyKeyMeta = await repoFindProxyKeyMetaByToken(proxyToken);
  if (!proxyKeyMeta || proxyKeyMeta.active !== true) {
    return NextResponse.json({ error: "invalid_proxy_key" }, { status: 403 });
  }

  // 2) Pick upstream Freepik API key
  let pick = pickUpstreamKeyFromEnv();
  if (!pick) pick = await repoSelectApiKey();
  if (!pick?.apiKeyCipher || !pick?.apiKeyId) {
    return NextResponse.json({ error: "no_upstream_key" }, { status: 503 });
  }

  const targetUrl = buildTargetUrl(req, pathParts);
  const method = req.method.toUpperCase();
  const isJsonBody = isJson(req.headers);
  const headers = buildUpstreamHeaders(req, pick.apiKeyCipher);

  let upstreamRes: Response;
  let reqBodyText: string | undefined;
  let reqJson: any | undefined;
  try {
    if (["GET", "HEAD"].includes(method)) {
      upstreamRes = await fetch(targetUrl, { method, headers });
    } else if (isJsonBody) {
      reqBodyText = await req.text();
      // 解析原始 JSON，用于记录 client 传来的 webhook_url（作为 C站回调地址）
      let origin: any = undefined;
      try { origin = reqBodyText ? JSON.parse(reqBodyText) : {}; } catch { origin = {}; }
      reqJson = origin && typeof origin === 'object' ? origin : {};
      // 简化：始终覆盖发送给 Freepik 的 webhook_url 为中转站固定地址
      const out = { ...(origin || {}) } as any;
      // Freepik 的回调固定打到中转站；同时把 C站的回调地址（origin.webhook_url）编码进查询参数 cb，供 webhook 端点回传使用
      const baseUrl = baseWebhookUrl();
      try {
        const cbRaw = typeof origin?.webhook_url === 'string' ? origin.webhook_url : undefined;
        if (cbRaw) {
          const u = new URL(baseUrl);
          u.searchParams.set('cb', base64urlEncode(cbRaw));
          out.webhook_url = u.toString();
        } else {
          out.webhook_url = baseUrl;
        }
      } catch {
        out.webhook_url = baseUrl;
      }
      upstreamRes = await fetch(targetUrl, { method, headers, body: JSON.stringify(out) });
    } else {
      // stream other content-types
      upstreamRes = await fetch(targetUrl, { method, headers, body: req.body as any });
    }
  } catch (e) {
    logger.warn("proxy.upstream_error", { targetUrl, error: String((e as any)?.message || e) });
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }

  // 3) If this looks like a task-creating POST with JSON response, snapshot task and maybe schedule polling
  let out: Response;
  const ct = upstreamRes.headers.get("content-type") || "";
  // Best-effort extract task id from headers when body is empty
  const headerRequestId = (() => {
    const candidates = [
      'x-request-id',
      'request-id',
      'x-task-id',
      'task-id',
      'x-freepik-task-id',
    ];
    for (const k of candidates) {
      const v = upstreamRes.headers.get(k);
      if (v && v.length > 0) return v;
    }
    const loc = upstreamRes.headers.get('location');
    if (loc) {
      // try to extract a UUID from the location url
      const m = loc.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/);
      if (m) return m[0];
    }
    return undefined;
  })();
  if (method === "POST") {
    const clone = upstreamRes.clone();
    try {
      // 尝试以文本读取；若非空再尝试 JSON 解析
      const raw = await clone.text();
      let data: any;
      try { data = raw ? JSON.parse(raw) : undefined; } catch { data = undefined; }
      if (data === undefined) {
        // 上游没返回 JSON 或为空：返回一个最小 JSON，至少让 C站有反馈（不添加额外字段）
        out = NextResponse.json({ ok: true, status: upstreamRes.status }, { status: upstreamRes.status });
        return out;
      }
      const snap = await createTaskSnapshot({
        tailPath,
        proxyKeyMeta: { id: proxyKeyMeta.id, default_callback_url: proxyKeyMeta.default_callback_url, site_id: proxyKeyMeta.site_id },
        upstreamApiKeyId: pick.apiKeyId,
        respJson: data,
        reqJson,
      });
      // 强制启用轮询兜底：不依赖环境开关（poll 端有 _proxy_entry 补偿）
      if (snap?.id) {
        try {
          await qstashScheduleTaskPoll({ taskId: snap.id, attempt: 0, delaySeconds: env.TASK_POLL_FIRST_DELAY_SECONDS });
          logger.info("proxy.poll_scheduled", { taskId: snap.id, delay: env.TASK_POLL_FIRST_DELAY_SECONDS });
        } catch {}
      }
      // 保持与 Freepik 完全一致：原样返回上游 JSON（不添加别名字段）
      out = NextResponse.json(data, { status: upstreamRes.status });
    } catch {
      // 如果读取失败，则透传 body，但清理与内容编码相关的响应头，避免客户端二次解压/长度不符
      out = new NextResponse(upstreamRes.body, { status: upstreamRes.status, headers: stripEncodingHeaders(upstreamRes.headers) });
    }
  } else {
    // 非 POST：透传 body，但清理编码相关头
    out = new NextResponse(upstreamRes.body, { status: upstreamRes.status, headers: stripEncodingHeaders(upstreamRes.headers) });
  }
  return out;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return handle(req, ctx as any);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return handle(req, ctx as any);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return handle(req, ctx as any);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return handle(req, ctx as any);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return handle(req, ctx as any);
}
export async function HEAD(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return handle(req, ctx as any);
}
export async function OPTIONS() {
  // Basic CORS preflight support (customize as needed)
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, X-Freepik-Api-Key, Authorization, X-Callback-Url");
  return new NextResponse(null, { status: 204, headers });
}
