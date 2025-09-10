import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";
import { redisAvailable, redisSetNX, redisDel } from "@/lib/redis";
import { repoGetApiKeyCipherById, repoGetTaskBasicById, repoGetTaskForSubmit } from "@/repo/supabaseRepo";
import { getStatusForModel } from "@/services/freepikDispatcher";
import { finalizeAndNotify } from "@/services/finalize";

export const runtime = "nodejs";

function allowByToken(req: NextRequest) {
  const token = req.headers.get("x-internal-submit");
  if (!env.ADMIN_SUBMIT_TOKEN) return true; // 未配置时直接允许
  return token === env.ADMIN_SUBMIT_TOKEN;
}

export async function POST(req: NextRequest) {
  if (!allowByToken(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const taskId = url.searchParams.get('task_id');
  if (!taskId) return NextResponse.json({ error: 'missing_task_id' }, { status: 400 });

  const lockKey = `poll_lock:${taskId}`;
  if (redisAvailable()) {
    const ok = await redisSetNX(lockKey, `${Date.now()}`, 3 * 60 * 1000).catch(() => false);
    if (!ok) return NextResponse.json({ ok: true, skipped: true, reason: 'locked' });
  }
  try {
    const basic = await repoGetTaskBasicById(taskId);
    const full = await repoGetTaskForSubmit(taskId);
    if (!full) return NextResponse.json({ error: 'task_not_found' }, { status: 404 });
    if (full.status === 'COMPLETED' || full.status === 'FAILED' || full.status === 'CANCELED') {
      return NextResponse.json({ ok: true, terminal: true, status: full.status });
    }
    // 至少等待 120s 再查，以优先 webhook
    const startTs = full.started_at ? Date.parse(full.started_at as any) : Date.parse(full.created_at as any);
    const elapsedSec = Math.max(0, Math.floor((Date.now() - startTs) / 1000));
    if (elapsedSec < 120) {
      return NextResponse.json({ ok: true, tooEarly: true, elapsedSec });
    }

    const apiKey = full.api_key_id ? await repoGetApiKeyCipherById(full.api_key_id) : null;
    const fpTaskId = full.freepik_task_id;
    if (!apiKey || !fpTaskId) {
      await finalizeAndNotify({ task: { id: taskId, callback_url: basic?.callback_url ?? null, freepik_task_id: fpTaskId }, status: 'FAILED', generated: [], resultPayload: { reason: 'missing_upstream_id_or_key' } });
      return NextResponse.json({ ok: true, finalized: true, status: 'FAILED' });
    }

    const modelName = full.model || 'mystic';
    const s = await getStatusForModel(modelName, fpTaskId, apiKey);
    if (s.status === 'COMPLETED') {
      const urls = Array.isArray(s.generated) ? s.generated : undefined;
      await finalizeAndNotify({ task: { id: taskId, callback_url: basic?.callback_url ?? null, freepik_task_id: fpTaskId }, status: 'COMPLETED', generated: urls });
      return NextResponse.json({ ok: true, status: 'COMPLETED' });
    }
    if (s.status === 'FAILED') {
      await finalizeAndNotify({ task: { id: taskId, callback_url: basic?.callback_url ?? null, freepik_task_id: fpTaskId }, status: 'FAILED', generated: [], resultPayload: { reason: 'upstream_failed' } });
      return NextResponse.json({ ok: true, status: 'FAILED' });
    }
    // 仍在处理中 → 返回给调用方由人继续决定是否稍后再试
    return NextResponse.json({ ok: true, status: s.status || 'IN_PROGRESS' });
  } catch (e: any) {
    logger.warn('admin.poll.task.error', { taskId, error: String(e?.message || e) });
    return NextResponse.json({ error: 'poll_failed', message: String(e?.message || e) }, { status: 502 });
  } finally {
    if (redisAvailable()) {
      await redisDel(lockKey).catch(() => {});
    }
  }
}

