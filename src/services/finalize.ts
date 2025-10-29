import { repoGetTaskForFinalize, repoUpdateTask } from "@/repo/supabaseRepo";
import { storeResultsToR2 } from "@/services/storage";
import { withLock } from "@/lib/locks";
import { logger } from "@/lib/logger";
import { isSafeCallbackUrl } from "@/lib/security";
import { env } from "@/lib/env";

type MinimalTask = { id: string; callback_url?: string | null; freepik_task_id?: string | null };

export async function finalizeAndNotify(params: {
  task: MinimalTask;
  status: "COMPLETED" | "FAILED";
  generated?: string[];
  resultPayload?: any;
}) {
  const { task, status, generated, resultPayload } = params;
  const lockKey = `completion_lock:${task.id}`;
  const ttlMs = Math.max(30_000, env.FINALIZE_LOCK_TTL_SECONDS * 1000);
  logger.info("开始终态处理", { taskId: task.id, status, genCount: Array.isArray(generated) ? generated.length : 0 });
  const run = await withLock(lockKey, ttlMs, async () => {
    logger.info("终态锁已获取", { taskId: task.id });
    // Soft guard by DB to reduce window
    try {
      const current = await repoGetTaskForFinalize(task.id);
      if (current) {
        const alreadyCompleted = current.status === "COMPLETED";
        const alreadyFailedAndFinalized = current.status === "FAILED" && current.result_payload != null;
        if (alreadyCompleted || alreadyFailedAndFinalized) {
          logger.info("跳过：任务已是终态", { taskId: task.id });
          return;
        }
      }
    } catch {}

    let r2Objects: any[] | undefined;
    try {
      if (status === "COMPLETED" && Array.isArray(generated) && generated.length > 0) {
        logger.info("开始上传到R2", { taskId: task.id, count: generated.length });
        r2Objects = await storeResultsToR2(task.id, generated);
        logger.info("R2上传完成", { taskId: task.id, count: Array.isArray(r2Objects) ? r2Objects.length : 0 });
      }
    } catch (e) {
      logger.warn("R2上传出错", { taskId: task.id, error: String((e as any)?.message || e) });
      // 继续走下去，DB 仍然记录终态
    }

    try {
      await repoUpdateTask(task.id, {
        status,
        resultPayload,
        resultUrls: Array.isArray(generated) ? generated : undefined,
        r2Objects,
      });
      logger.info("数据库已写入终态", { taskId: task.id, status });
    } catch (e) {
      logger.error("数据库更新终态失败", { taskId: task.id, error: String((e as any)?.message || e) });
    }

    // 尝试回调（最简负载：freepik_task_id/status/public_url）
    if (task.callback_url && isSafeCallbackUrl(task.callback_url)) {
      try {
        // Add a conservative timeout to avoid holding the lock too long
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), Math.max(1000, env.CALLBACK_TIMEOUT_MS));
        const publicUrl = Array.isArray(r2Objects) && r2Objects.length > 0 ? (r2Objects[0]?.public_url || null) : null;
        const callbackBody: Record<string, any> = {
          freepik_task_id: task.freepik_task_id,
          status,
          public_url: publicUrl,
        };
        if (Array.isArray(generated)) callbackBody.generated = generated;
        if (resultPayload !== undefined) callbackBody.result_payload = resultPayload ?? null;
        await fetch(task.callback_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(callbackBody),
          signal: ac.signal,
        }).finally(() => clearTimeout(timer));
        logger.info("已回调下游", { taskId: task.id, url: task.callback_url });
      } catch (e) {
        logger.warn("回调下游失败", { taskId: task.id, error: String((e as any)?.message || e) });
      }
    } else if (task.callback_url) {
      logger.warn("回调URL不安全，已拦截", { taskId: task.id, url: task.callback_url });
    }
  });
  if (run === undefined) {
    // 未拿到锁，说明有并发完成流程在进行，直接返回
    logger.info("跳过：已有终态处理在进行", { taskId: task.id });
    return;
  }
  logger.info("终态处理结束", { taskId: task.id });
}

export async function finalizeAndNotifyStateless(params: {
  freepikTaskId: string;
  callbackUrl: string | null | undefined;
  status: "COMPLETED" | "FAILED";
  generated?: string[];
  resultPayload?: any;
}) {
  const { freepikTaskId, callbackUrl, status, generated, resultPayload } = params;
  const lockKey = `completion_lock:fp:${freepikTaskId}`;
  const ttlMs = Math.max(30_000, env.FINALIZE_LOCK_TTL_SECONDS * 1000);
  logger.info("开始终态处理", { taskId: freepikTaskId, status, genCount: Array.isArray(generated) ? generated.length : 0 });
  const run = await withLock(lockKey, ttlMs, async () => {
    logger.info("终态锁已获取", { taskId: freepikTaskId });

    let r2Objects: any[] | undefined;
    try {
      if (status === "COMPLETED" && Array.isArray(generated) && generated.length > 0) {
        logger.info("开始上传到R2", { taskId: freepikTaskId, count: generated.length });
        r2Objects = await storeResultsToR2(freepikTaskId, generated);
        logger.info("R2上传完成", { taskId: freepikTaskId, count: Array.isArray(r2Objects) ? r2Objects.length : 0 });
      }
    } catch (e) {
      logger.warn("R2上传出错", { taskId: freepikTaskId, error: String((e as any)?.message || e) });
    }

    if (callbackUrl && isSafeCallbackUrl(callbackUrl)) {
      try {
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), Math.max(1000, env.CALLBACK_TIMEOUT_MS));
        const publicUrl = Array.isArray(r2Objects) && r2Objects.length > 0 ? (r2Objects[0]?.public_url || null) : null;
        const callbackBody: Record<string, any> = {
          freepik_task_id: freepikTaskId,
          status,
          public_url: publicUrl,
        };
        if (Array.isArray(generated)) callbackBody.generated = generated;
        callbackBody.result_payload = resultPayload ?? null;
        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(callbackBody),
          signal: ac.signal,
        }).finally(() => clearTimeout(timer));
        logger.info("已回调下游", { taskId: freepikTaskId, url: callbackUrl });
      } catch (e) {
        logger.warn("回调下游失败", { taskId: freepikTaskId, error: String((e as any)?.message || e) });
      }
    } else if (callbackUrl) {
      logger.warn("回调URL不安全，已拦截", { taskId: freepikTaskId, url: callbackUrl });
    }
  });
  if (run === undefined) {
    logger.info("跳过：已有终态处理在进行", { taskId: freepikTaskId });
    return;
  }
  logger.info("终态处理结束", { taskId: freepikTaskId });
}
