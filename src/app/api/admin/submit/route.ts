import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { Receiver } from "@upstash/qstash";
import { repoGetApiKeyCipherById, repoGetTaskForSubmit, repoSelectApiKey, repoUpdateTask } from "@/repo/supabaseRepo";
import { dispatchFreepikTask } from "@/services/freepikDispatcher";
import { createImageTask, createVideoTask } from "@/services/freepik";
import { finalizeAndNotify } from "@/services/finalize";
import { qstashSchedulePoll, qstashScheduleTaskPoll } from "@/lib/qstash";
import { redisAvailable, redisSetNX } from "@/lib/redis";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

function getReceiver(): Receiver | null {
  if (!env.QSTASH_CURRENT_SIGNING_KEY) return null;
  try {
    return new Receiver({ currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY!, nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY });
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // 允许两类调用：
  // 1) 内部调用：若未配置 ADMIN_SUBMIT_TOKEN 则默认放行；若已配置则校验 x-internal-submit
  // 2) QStash 调用：校验 upstash-signature（仅当配置了签名密钥时）
  const internalToken = req.headers.get("x-internal-submit");
  const allowInternal = env.ADMIN_SUBMIT_TOKEN ? internalToken === env.ADMIN_SUBMIT_TOKEN : true;
  const receiver = getReceiver();
  if (!allowInternal && receiver) {
    const sig = req.headers.get("upstash-signature") || req.headers.get("Upstash-Signature");
    if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 401 });
    const bodyText = await req.text();
    const ok = await Promise.resolve(receiver.verify({ signature: sig, body: bodyText }));
    if (!ok) return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    // 下方不读取 body，因此无需重建
  }

  const url = new URL(req.url);
  const taskId = url.searchParams.get("task_id");
  if (!taskId) return NextResponse.json({ error: "missing_task_id" }, { status: 400 });

  const task = await repoGetTaskForSubmit(taskId);
  if (!task) return NextResponse.json({ error: "task_not_found" }, { status: 404 });
  if (task.status !== "PENDING") return NextResponse.json({ ok: true, skipped: true });

  logger.info("提交上游开始", { taskId: task.id, model: task.model, type: task.type });
  let chosenApiKeyId: string | null = task.api_key_id ?? null;
  let apiKey = task.api_key_id ? await repoGetApiKeyCipherById(task.api_key_id) : null;
  if (!apiKey) {
    const pick = await repoSelectApiKey();
    if (!pick?.apiKeyCipher || !pick?.apiKeyId) return NextResponse.json({ error: "no_api_key_in_db" }, { status: 503 });
    apiKey = pick.apiKeyCipher;
    chosenApiKeyId = pick.apiKeyId;
  }
  logger.info("已选择API Key", { taskId: task.id, hasKey: Boolean(apiKey) });

  // Prefer explicit WEBHOOK_URL from env when provided; accepts either full URL or base
  const webhookUrl = (() => {
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
  })();
  const payload = (task.input_payload || {}) as any;

  try {
    let fpResp: { task_id?: string; status?: string; data?: any } | undefined;
    if (task.model) {
      fpResp = await dispatchFreepikTask({ modelName: task.model, webhookUrl, apiKey, payload });
    } else if (task.type === "image" && payload.prompt) {
      fpResp = await createImageTask({ prompt: payload.prompt, webhookUrl, apiKey, extras: payload.extras });
    } else if (task.type === "video" && payload.prompt) {
      fpResp = await createVideoTask({ prompt: payload.prompt, webhookUrl, apiKey, extras: payload.extras });
    } else if (task.type === "edit") {
      fpResp = { task_id: undefined, status: "IN_PROGRESS" };
    } else {
      return NextResponse.json({ error: "invalid type/payload" }, { status: 400 });
    }

    const upstreamStatus = String(fpResp?.status || "").toUpperCase();
    const treatAsInProgress = ["IN_PROGRESS", "CREATED", "PROCESSING", "QUEUED"].includes(upstreamStatus);
    await repoUpdateTask(task.id, {
      status: treatAsInProgress ? "IN_PROGRESS" : task.status,
      freepikTaskId: fpResp?.task_id,
      upstreamResp: fpResp,
      apiKeyId: chosenApiKeyId || undefined as any,
    });
    logger.info("Freepik已受理", { taskId: task.id, freepik_task_id: fpResp?.task_id, status: fpResp?.status });
    // 固定策略：提交成功后，在2分钟时开始单任务轮询；确保全局兜底不受 Redis 影响
    const canQstash = Boolean(env.QSTASH_TOKEN && env.NEXT_PUBLIC_SITE_URL);
    let perTaskScheduled = false;
    if (canQstash) {
      if (redisAvailable()) {
        try {
          const ok = await redisSetNX(`qstash_lock:${task.id}`, `${Date.now()}`, 40 * 60 * 1000);
          if (!ok) {
            // Double-check value; if missing, degrade and still schedule to avoid lost polling when Redis is flaky
            try {
              const { redisGet } = await import("@/lib/redis");
              const val = await redisGet(`qstash_lock:${task.id}`);
              if (val) {
                logger.debug("submit.qstash_lock.skip", { id: task.id });
              } else {
                const sched = await qstashScheduleTaskPoll({ taskId: task.id, attempt: 0, delaySeconds: env.TASK_POLL_FIRST_DELAY_SECONDS });
                perTaskScheduled = Boolean((sched as any)?.scheduled);
                logger.warn("submit.qstash_lock.degraded_scheduled", { id: task.id, firstDelaySeconds: env.TASK_POLL_FIRST_DELAY_SECONDS, scheduled: perTaskScheduled, status: (sched as any)?.status });
              }
            } catch {
              const sched = await qstashScheduleTaskPoll({ taskId: task.id, attempt: 0, delaySeconds: env.TASK_POLL_FIRST_DELAY_SECONDS });
              perTaskScheduled = Boolean((sched as any)?.scheduled);
              logger.warn("submit.qstash_lock.error_scheduled", { id: task.id, firstDelaySeconds: env.TASK_POLL_FIRST_DELAY_SECONDS, scheduled: perTaskScheduled, status: (sched as any)?.status });
            }
          } else {
            const sched = await qstashScheduleTaskPoll({ taskId: task.id, attempt: 0, delaySeconds: env.TASK_POLL_FIRST_DELAY_SECONDS });
            perTaskScheduled = Boolean((sched as any)?.scheduled);
            logger.info("已安排单任务轮询", { taskId: task.id, firstDelaySeconds: env.TASK_POLL_FIRST_DELAY_SECONDS, scheduled: perTaskScheduled, status: (sched as any)?.status });
          }
        } catch {
          try {
            const sched = await qstashScheduleTaskPoll({ taskId: task.id, attempt: 0, delaySeconds: env.TASK_POLL_FIRST_DELAY_SECONDS });
            perTaskScheduled = Boolean((sched as any)?.scheduled);
            logger.warn("submit.qstash_lock.catch_scheduled", { id: task.id, scheduled: perTaskScheduled, status: (sched as any)?.status });
          } catch {}
        }
      } else {
        // 无 Redis：也尝试单任务轮询（不加锁）
        try {
          const sched = await qstashScheduleTaskPoll({ taskId: task.id, attempt: 0, delaySeconds: env.TASK_POLL_FIRST_DELAY_SECONDS });
          perTaskScheduled = Boolean((sched as any)?.scheduled);
          logger.info("已安排单任务轮询(无Redis)", { taskId: task.id, scheduled: perTaskScheduled, status: (sched as any)?.status });
        } catch {}
      }
      // 始终安排一次全局兜底（由 DB 去重），避免单任务调度失败时静默挂起
      try {
        const res = await qstashSchedulePoll(env.TASK_POLL_FIRST_DELAY_SECONDS);
        logger.info("已安排全局轮询兜底", { taskId: task.id, delaySeconds: env.TASK_POLL_FIRST_DELAY_SECONDS, scheduled: (res as any)?.scheduled === true, status: (res as any)?.status });
      } catch {}
    } else {
      // 无 QStash 能力：最佳努力触发一次即时单任务轮询（可能过早，但可见性更好）
      try {
        const submitUrl = `${env.NEXT_PUBLIC_SITE_URL}/api/admin/poll/task?task_id=${encodeURIComponent(task.id)}`;
        const headers: Record<string, string> = {};
        if (env.ADMIN_SUBMIT_TOKEN) headers["x-internal-submit"] = env.ADMIN_SUBMIT_TOKEN;
        void fetch(submitUrl, { method: "POST", headers }).catch(() => {});
        logger.warn("QStash不可用：已触发一次即时轮询", { taskId: task.id });
      } catch {}
    }
    return NextResponse.json({ ok: true, submitted: true, task_id: fpResp?.task_id });
  } catch (e: any) {
    logger.error("提交上游失败", { taskId: task.id, error: String(e?.message || e) });
    try {
      await repoUpdateTask(task.id, { status: "FAILED", error: String(e?.message || e) });
    } catch {}
    // Notify callback on submit failure as FAILED
    await finalizeAndNotify({ task: { id: task.id, callback_url: task.callback_url, freepik_task_id: null }, status: "FAILED", generated: [], resultPayload: { reason: "submit_failed", message: String(e?.message || e) } });
    return NextResponse.json({ error: "submit_failed" }, { status: 500 });
  }
}
