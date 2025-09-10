import { NextResponse } from "next/server";
import { getStatusForModel } from "@/services/freepikDispatcher";
import { env } from "@/lib/env";
import { repoGetApiKeyCipherById, repoGetTaskBasicById, repoListInProgressTasks, repoUpdateTask } from "@/repo/supabaseRepo";
import { finalizeAndNotify } from "@/services/finalize";

export const runtime = "nodejs";

export async function GET() {
  const inProgress = await repoListInProgressTasks();
  const results = [] as Array<{ id: string; status: string | undefined }>;
  for (const t of inProgress) {
    // Time-based backoff: first status check >=60s after started_at; fail after 240s total
    const startTs = t.started_at ? Date.parse(t.started_at) : Date.parse(t.created_at);
    const elapsedSec = Math.max(0, Math.floor((Date.now() - startTs) / 1000));
    if (elapsedSec < 60) {
      // Skip early checks; give webhook a chance
      continue;
    }
    if (elapsedSec >= 240) {
      // Timeout -> mark failed and notify (load callback_url)
      const basic = (await repoGetTaskBasicById(t.id)) || { id: t.id, callback_url: null, freepik_task_id: t.freepik_task_id };
      await finalizeAndNotify({ task: basic, status: "FAILED", generated: [], resultPayload: { reason: "timeout", elapsed: elapsedSec } });
      results.push({ id: t.id, status: "FAILED" });
      continue;
    }
    // Always resolve API key from DB (no env fallback)
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
    } catch (e) {
      results.push({ id: t.id, status: "ERROR" });
    }
  }
  return NextResponse.json({ polled: results.length, results });
}
