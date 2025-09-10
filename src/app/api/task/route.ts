import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";
import { Task, TaskPayload, TaskType } from "@/lib/types";
import { createImageTask, createVideoTask } from "@/services/freepik";
import { dispatchFreepikTask } from "@/services/freepikDispatcher";
import { repoCreateTask, repoUpdateTask } from "@/repo/supabaseRepo";
import { requireProxyAuth } from "@/lib/proxyAuth";
import { assertSupabase } from "@/lib/supabase";
// Note: do not schedule submit via QStash; we only use QStash for polling
import { finalizeAndNotify } from "@/services/finalize";

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: NextRequest) {
  let createdId: string | null = null;
  let cbUrl: string | undefined;
  try {
    // Require proxy key from client (C站) to use the relay API
    try {
      await requireProxyAuth(req as any);
    } catch (e: any) {
      const code = e?.message === "missing_proxy_key" ? 401 : 403;
      return NextResponse.json({ error: e?.message || "unauthorized" }, { status: code });
    }
    const body = await req.json();
    let type: TaskType | undefined = body?.type as TaskType | undefined;
    const payload: TaskPayload = body?.payload || {};
    const callbackUrl: string | undefined = body?.callback_url;
    cbUrl = callbackUrl;
    const cSiteId: string | undefined = body?.c_site_id;

    // Require callback_url, and require either model or type
    if (!callbackUrl) {
      return NextResponse.json({ error: "callback_url is required" }, { status: 400 });
    }
    if (!body?.model && !type) {
      return NextResponse.json({ error: "model or type is required" }, { status: 400 });
    }

    // If model provided, infer type from models.kind
    if (body?.model && !type) {
      const supabase = assertSupabase();
      const { data: modelRow, error: modelErr } = await (supabase as any)
        .from("models")
        .select("kind")
        .eq("name", body.model)
        .maybeSingle();
      if (modelErr) throw modelErr;
      if (!modelRow?.kind) {
        return NextResponse.json({ error: "unknown_model" }, { status: 400 });
      }
      type = modelRow.kind as TaskType;
    }

    // Persist task (PENDING) first
    const created = await repoCreateTask({
      siteId: cSiteId,
      type: type as TaskType,
      model: body?.model,
      callbackUrl,
      inputPayload: payload as any,
      apiKeyId: undefined,
      status: "PENDING",
    });
    createdId = created.id;
    logger.info("任务已创建，准备异步提交", { taskId: created.id, type, model: body?.model });

    // Submit tasks via local internal call only (no QStash for submit). Fire-and-forget.
    // If submit route enforces QStash signature, require ADMIN_SUBMIT_TOKEN header to authorize.
    try {
      const submitUrl = `${env.NEXT_PUBLIC_SITE_URL}/api/admin/submit?task_id=${encodeURIComponent(created.id)}`;
      const headers: Record<string, string> = {};
      if (env.ADMIN_SUBMIT_TOKEN) headers["x-internal-submit"] = env.ADMIN_SUBMIT_TOKEN;
      void fetch(submitUrl, { method: "POST", headers }).catch(() => {});
      logger.info("任务已受理，开始后台提交", { id: created.id, model: body?.model, type });
    } catch {}
    return NextResponse.json({ id: created.id, status: created.status });
  } catch (err) {
    logger.error("任务创建失败", { error: String((err as any)?.message || err) });
    // Best-effort: if a task was created earlier in this request, mark FAILED and notify
    try {
      if (createdId) {
        await repoUpdateTask(createdId, { status: "FAILED", error: "submit_failed" });
        await finalizeAndNotify({ task: { id: createdId, callback_url: cbUrl ?? null, freepik_task_id: null }, status: "FAILED", generated: [], resultPayload: { reason: "submit_failed" } });
      }
    } catch {}
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
