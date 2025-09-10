import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { logger } from "@/lib/logger";
import { redisAvailable, redisSetNX, redisDel } from "@/lib/redis";
import { repoGetApiKeyCipherById, repoGetTaskBasicById, repoGetTaskForSubmit, repoUpdateTask } from "@/repo/supabaseRepo";
import { getStatusForModel } from "@/services/freepikDispatcher";
import { finalizeAndNotify } from "@/services/finalize";
import { qstashScheduleTaskPoll } from "@/lib/qstash";
import { env } from "@/lib/env";

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
  // 验签（若配置）
  const receiver = getReceiver();
  if (receiver) {
    const sig = req.headers.get("upstash-signature") || req.headers.get("Upstash-Signature");
    if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 401 });
    const bodyText = await req.text();
    const ok = await Promise.resolve(receiver.verify({ signature: sig, body: bodyText }));
    if (!ok) return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    // 重新构造 JSON
    try { (req as any)._json = JSON.parse(bodyText); } catch {}
  }

  const body = (receiver ? (req as any)._json : await req.json()) || {};
  const taskId = body?.taskId as string | undefined;
  const attempt = Number(body?.attempt ?? 0) || 0;
  if (!taskId) return NextResponse.json({ error: "missing_taskId" }, { status: 400 });
  logger.info("开始单任务轮询", { taskId, attempt });

  // 单任务轮询锁，避免重复并发轮询
  const lockKey = `poll_lock:${taskId}`;
  let locked = true;
  if (redisAvailable()) {
    try {
      locked = await redisSetNX(lockKey, `${Date.now()}`, 3 * 60 * 1000);
      if (!locked) {
        try {
          const { redisGet } = await import("@/lib/redis");
          const val = await redisGet(lockKey);
          if (!val) {
            // Degraded: proceed to avoid silent drop
            locked = true;
            logger.warn("轮询锁降级：Redis无值但SETNX为false，继续执行", { taskId });
          }
        } catch {
          locked = true;
          logger.warn("轮询锁降级：Redis异常，继续执行", { taskId });
        }
      }
    } catch {
      // On error, allow proceed (degraded)
      locked = true;
      logger.warn("轮询锁异常，降级继续执行", { taskId });
    }
  }
  if (!locked) {
    logger.info("轮询跳过：已被其他实例加锁", { taskId });
    return NextResponse.json({ ok: true, skipped: true, reason: "locked" });
  }

  try {
    // 读取任务，若已终态则短路
    const basic = await repoGetTaskBasicById(taskId);
    const full = await repoGetTaskForSubmit(taskId);
    if (!full) {
      logger.warn("轮询失败：任务不存在", { taskId });
      return NextResponse.json({ error: "task_not_found" }, { status: 404 });
    }
    if (full.status === "COMPLETED" || full.status === "FAILED" || full.status === "CANCELED") {
      logger.info("轮询短路：任务已终态", { taskId, status: full.status });
      return NextResponse.json({ ok: true, skipped: true, terminal: true });
    }
    // 过早检查，延后
    const startTs = full.started_at ? Date.parse(full.started_at as any) : Date.parse(full.created_at as any);
    const elapsedSec = Math.max(0, Math.floor((Date.now() - startTs) / 1000));
    const isVideo = (full.model || "").includes("video") || full.type === "video";
    const minFirst = isVideo ? env.POLL_MIN_FIRST_VIDEO_SECONDS : env.POLL_MIN_FIRST_IMAGE_SECONDS;
    if (elapsedSec < minFirst) {
      const delay = Math.max(1, minFirst - elapsedSec);
      await qstashScheduleTaskPoll({ taskId, attempt, delaySeconds: delay });
      logger.info("未到首查时间，推迟轮询", { taskId, delay });
      return NextResponse.json({ ok: true, rescheduled: true, delay });
    }

    // 超过 5 分钟仍未完成 → 直接失败
    if (elapsedSec >= env.TASK_POLL_TIMEOUT_SECONDS) {
      logger.warn("轮询超时，标记任务失败", { taskId, elapsedSec });
      await finalizeAndNotify({ task: { id: taskId, callback_url: basic?.callback_url ?? null, freepik_task_id: full.freepik_task_id }, status: "FAILED", generated: [], resultPayload: { reason: "timeout", elapsed: elapsedSec } });
      return NextResponse.json({ ok: true, status: "FAILED", reason: "timeout" });
    }

    // 没有 Freepik 任务号则无法查询
    const apiKey = full.api_key_id ? await repoGetApiKeyCipherById(full.api_key_id) : null;
    const fpTaskId = full.freepik_task_id;
    if (!apiKey || !fpTaskId) {
      // 视为失败
      await finalizeAndNotify({ task: { id: taskId, callback_url: basic?.callback_url ?? null, freepik_task_id: fpTaskId }, status: "FAILED", generated: [], resultPayload: { reason: "missing_upstream_id_or_key" } });
      return NextResponse.json({ ok: true, finalized: true, status: "FAILED" });
    }

    try {
      const modelName = full.model || "mystic";
      const s = await getStatusForModel(modelName, fpTaskId, apiKey);
      if (s.status === "COMPLETED") {
        const urls = Array.isArray(s.generated) ? s.generated : undefined;
        logger.info("轮询获取到完成状态，进入终态处理", { taskId });
        await finalizeAndNotify({ task: { id: taskId, callback_url: basic?.callback_url ?? null, freepik_task_id: fpTaskId }, status: "COMPLETED", generated: urls });
        return NextResponse.json({ ok: true, status: "COMPLETED" });
      } else if (s.status === "FAILED") {
        logger.info("轮询获取到失败状态，进入终态处理", { taskId });
        await finalizeAndNotify({ task: { id: taskId, callback_url: basic?.callback_url ?? null, freepik_task_id: fpTaskId }, status: "FAILED", generated: [], resultPayload: { reason: "upstream_failed" } });
        return NextResponse.json({ ok: true, status: "FAILED" });
      }
      // 仍在处理中 → 固定每30秒查询一次，直到 5 分钟
      const nextAttempt = attempt + 1;
      const nextElapsed = elapsedSec + 30;
      const delay = Math.max(1, Math.min(30, env.TASK_POLL_TIMEOUT_SECONDS - elapsedSec));
      await qstashScheduleTaskPoll({ taskId, attempt: nextAttempt, delaySeconds: delay });
      logger.info("未完成，已安排下次轮询", { taskId, attempt: nextAttempt, delay });
      return NextResponse.json({ ok: true, rescheduled: true, attempt: nextAttempt, delay, nextElapsed });
    } catch (e) {
      // API 错误 → 允许更多尝试
      // API 错误：同样按30秒节奏重试，直到 5 分钟超时由上方分支兜底
      const nextAttempt = attempt + 1;
      const delay = Math.max(1, Math.min(30, 300 - elapsedSec));
      await qstashScheduleTaskPoll({ taskId, attempt: nextAttempt, delaySeconds: delay });
      logger.warn("轮询查询上游失败，稍后重试", { taskId, attempt: nextAttempt, delay, error: String((e as any)?.message || e) });
      return NextResponse.json({ ok: true, rescheduled: true, attempt: nextAttempt, delay, error: String((e as any)?.message || e) });
    }
  } finally {
    if (redisAvailable()) {
      try { await redisDel(lockKey); } catch {}
    }
  }
}
