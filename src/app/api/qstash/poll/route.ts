import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { Receiver } from "@upstash/qstash";
import { getStatusForModel } from "@/services/freepikDispatcher";
import { repoGetApiKeyCipherById, repoGetTaskBasicById, repoListInProgressTasks } from "@/repo/supabaseRepo";
import { finalizeAndNotify } from "@/services/finalize";
import { qstashSchedulePoll } from "@/lib/qstash";

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
  // Verify Upstash QStash signature if keys are configured
  const receiver = getReceiver();
  if (receiver) {
    const sig = req.headers.get("upstash-signature") || req.headers.get("Upstash-Signature");
    if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 401 });
    const bodyText = await req.text();
    const ok = await Promise.resolve(receiver.verify({ signature: sig, body: bodyText }));
    if (!ok) return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  // Run the same logic as /api/admin/poll
  const inProgress = await repoListInProgressTasks();
  const results = [] as Array<{ id: string; status: string | undefined }>;
  for (const t of inProgress) {
    // Time-based backoff: first status check >=60s after started_at; fail after 240s total
    const startTs = t.started_at ? Date.parse(t.started_at) : Date.parse(t.created_at);
    const elapsedSec = Math.max(0, Math.floor((Date.now() - startTs) / 1000));
    if (elapsedSec < env.GLOBAL_POLL_MIN_FIRST_SECONDS) {
      // Skip early checks; give webhook a chance
      continue;
    }
    if (elapsedSec >= env.GLOBAL_POLL_TIMEOUT_SECONDS) {
      const task = (await repoGetTaskBasicById(t.id)) || { id: t.id, callback_url: null, freepik_task_id: t.freepik_task_id };
      await finalizeAndNotify({ task, status: "FAILED", generated: [], resultPayload: { reason: "timeout", elapsed: elapsedSec } });
      results.push({ id: t.id, status: "FAILED" });
      continue;
    }
    const apiKey = t.api_key_id ? await repoGetApiKeyCipherById(t.api_key_id) : null;
    if (!apiKey || !t.freepik_task_id) continue;
    try {
      const modelName = t.model || "mystic";
      const s = await getStatusForModel(modelName, t.freepik_task_id, apiKey);
      if (s.status === "COMPLETED") {
        const urls = Array.isArray(s.generated) ? s.generated : undefined;
        const task = (await repoGetTaskBasicById(t.id)) || { id: t.id, callback_url: null, freepik_task_id: t.freepik_task_id };
        await finalizeAndNotify({ task, status: "COMPLETED", generated: urls });
      } else if (s.status === "FAILED") {
        const task = (await repoGetTaskBasicById(t.id)) || { id: t.id, callback_url: null, freepik_task_id: t.freepik_task_id };
        await finalizeAndNotify({ task, status: "FAILED", generated: [], resultPayload: { reason: "upstream_failed" } });
      }
      results.push({ id: t.id, status: s.status });
    } catch {
      results.push({ id: t.id, status: "ERROR" });
    }
  }
  // Self-schedule next run without using Schedules (optional)
  if (inProgress.length > 0) {
    // Adaptive scheduling: if some tasks are not yet past 60s, run sooner; else 60s
    const needSooner = inProgress.some((t) => {
      const startTs = t.started_at ? Date.parse(t.started_at) : Date.parse(t.created_at);
      const elapsedSec = Math.max(0, Math.floor((Date.now() - startTs) / 1000));
      return elapsedSec < env.GLOBAL_POLL_MIN_FIRST_SECONDS;
    });
    const delay = needSooner ? Math.min(30, env.GLOBAL_POLL_MIN_FIRST_SECONDS) : env.GLOBAL_POLL_MIN_FIRST_SECONDS;
    try { await qstashSchedulePoll(delay); } catch {}
  }
  return NextResponse.json({ polled: results.length, results, nextScheduled: inProgress.length > 0 });
}
