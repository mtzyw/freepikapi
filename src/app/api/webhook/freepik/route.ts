import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { repoGetTaskByFreepikTaskId, repoInsertInboundWebhook } from "@/repo/supabaseRepo";
import { finalizeAndNotify } from "@/services/finalize";
// no signature verification per user request

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const sig = req.headers.get("x-freepik-signature");
    const body = JSON.parse(raw || "{}");
    const fpTaskId: string | undefined = body?.data?.task_id ?? body?.task_id;
    const status: string | undefined = body?.data?.status ?? body?.status;
    const generated: string[] | undefined = body?.data?.generated ?? body?.generated;

    if (!fpTaskId) {
      // 不返回4xx给上游，避免被判定失败；记录日志便于排查
      logger.warn("Webhook缺少task_id，忽略", {});
      return NextResponse.json({ ok: true, ignored: true }, { status: 202 });
    }
    logger.info("收到Freepik回调", { freepik_task_id: fpTaskId, status, generated_count: Array.isArray(generated) ? generated.length : 0 });
    const sUpper = String(status || '').toUpperCase();
    const terminalCompleted = sUpper === 'COMPLETED' || sUpper === 'SUCCEEDED';
    const terminalFailed = sUpper === 'FAILED' || sUpper === 'ERROR';
    if (!terminalCompleted && !terminalFailed) {
      // 中间态：直接跳过（既不写库也不落快照），降低噪音与锁争用
      logger.info("Webhook为中间态，忽略处理", { upstream_status: sUpper, freepik_task_id: fpTaskId });
      return NextResponse.json({ ok: true, ignored: true }, { status: 202 });
    }

    // 仅终态写入 webhook 快照，便于审计/重放
    try {
      await repoInsertInboundWebhook({ freepikTaskId: fpTaskId, payload: body, sigHeader: sig, sigOk: null });
    } catch {}

    const task = await repoGetTaskByFreepikTaskId(fpTaskId);
    if (!task) {
      // 可能是竞态：提交刚返回，DB 尚未写入 freepik_task_id；用 202 表示接受但暂不处理
      logger.info("Webhook未找到对应任务，可能是竞态，先忽略", { freepik_task_id: fpTaskId });
      return NextResponse.json({ ok: true, ignored: true }, { status: 202 });
    }

    if (terminalCompleted) {
      logger.info("Webhook判定为完成，进入终态处理", { taskId: task.id });
      await finalizeAndNotify({ task, status: "COMPLETED", generated, resultPayload: body });
    } else if (terminalFailed) {
      logger.info("Webhook判定为失败，进入终态处理", { taskId: task.id });
      await finalizeAndNotify({ task, status: "FAILED", generated, resultPayload: body });
    }

    // finalizeAndNotify already sends callback on COMPLETED/FAILED

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Webhook处理异常", { error: String((err as any)?.message || err) });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
