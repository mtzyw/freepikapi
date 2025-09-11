import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { repoGetTaskByFreepikTaskId, repoInsertInboundWebhook } from "@/repo/supabaseRepo";
import { finalizeAndNotify, finalizeAndNotifyStateless } from "@/services/finalize";
import { env } from "@/lib/env";
import { base64urlDecode, timingSafeEqualHex, hmacSHA256Hex } from "@/lib/sign";
// no signature verification per user request

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const ctxParam = url.searchParams.get("ctx");
    const sigParam = url.searchParams.get("sig");
    const cbParam = url.searchParams.get("cb");
    const raw = await req.text();
    const sig = req.headers.get("x-freepik-signature");
    let body: any = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch (e) {
      // 容错：无效 JSON 直接忽略，避免 500 导致上游重试风暴
      logger.warn("Webhook解析JSON失败，忽略", { error: String((e as any)?.message || e) });
      return NextResponse.json({ ok: true, ignored: true, reason: "invalid_json" }, { status: 202 });
    }
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

    // 仅终态处理；分两种模式：stateful（默认）与 stateless（ctx+sig）
    if (env.PROXY_STATELESS && ctxParam && sigParam && env.WEBHOOK_TOKEN_SECRET) {
      // 验签 ctx
      try {
        const ctxBuf = base64urlDecode(ctxParam);
        const ctxJson = JSON.parse(ctxBuf.toString("utf-8"));
        const expect = hmacSHA256Hex(env.WEBHOOK_TOKEN_SECRET, ctxParam);
        const ok = timingSafeEqualHex(expect, sigParam);
        if (!ok) {
          logger.warn("webhook.ctx_sig_mismatch", {});
          return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
        }
        const cbUrl: string | undefined = ctxJson?.callback_url;
        if (terminalCompleted) {
          logger.info("Webhook判定为完成，进入终态处理", { taskId: fpTaskId });
          await finalizeAndNotifyStateless({ freepikTaskId: fpTaskId, callbackUrl: cbUrl, status: "COMPLETED", generated, resultPayload: body });
        } else if (terminalFailed) {
          logger.info("Webhook判定为失败，进入终态处理", { taskId: fpTaskId });
          await finalizeAndNotifyStateless({ freepikTaskId: fpTaskId, callbackUrl: cbUrl, status: "FAILED", generated, resultPayload: body });
        }
      } catch (e) {
        logger.warn("webhook.ctx_parse_error", { error: String((e as any)?.message || e) });
        return NextResponse.json({ error: "invalid_ctx" }, { status: 400 });
      }
    } else {
      // stateful 路径：写入 webhook 快照并通过 DB 任务映射终态处理
      try {
        await repoInsertInboundWebhook({ freepikTaskId: fpTaskId, payload: body, sigHeader: sig, sigOk: null });
      } catch {}

      const task = await repoGetTaskByFreepikTaskId(fpTaskId);
      if (!task) {
        // 兼容：若没有任务映射，但 webhook URL 携带了 cb（C站回调地址），直接走无状态终态处理
        if (cbParam) {
          try {
            const buf = base64urlDecode(cbParam);
            const cbUrl = buf.toString("utf-8");
            if (terminalCompleted) {
              logger.info("Webhook判定为完成，进入终态处理", { taskId: fpTaskId });
              await finalizeAndNotifyStateless({ freepikTaskId: fpTaskId, callbackUrl: cbUrl, status: "COMPLETED", generated, resultPayload: body });
            } else if (terminalFailed) {
              logger.info("Webhook判定为失败，进入终态处理", { taskId: fpTaskId });
              await finalizeAndNotifyStateless({ freepikTaskId: fpTaskId, callbackUrl: cbUrl, status: "FAILED", generated, resultPayload: body });
            }
            return NextResponse.json({ ok: true });
          } catch {
            logger.info("Webhook未找到对应任务，可能是竞态，先忽略", { freepik_task_id: fpTaskId });
            return NextResponse.json({ ok: true, ignored: true }, { status: 202 });
          }
        }
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
    }

    // finalizeAndNotify already sends callback on COMPLETED/FAILED

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Webhook处理异常", { error: String((err as any)?.message || err) });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
