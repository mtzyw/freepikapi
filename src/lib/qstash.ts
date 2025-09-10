import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { repoTryScheduleOnce } from "@/repo/schedulerRepo";

function qstashPublishUrl(targetUrl: string) {
  const base = (env.QSTASH_URL || "https://qstash.upstash.io").replace(/\/$/, "");
  // v2 publish endpoint expects the target URL appended raw (not percent-encoded)
  // Example: https://qstash.upstash.io/v2/publish/https://example.com/api
  return `${base}/v2/publish/${targetUrl}`;
}

export async function qstashSchedulePoll(delaySeconds = 60) {
  if (!env.QSTASH_TOKEN || !env.NEXT_PUBLIC_SITE_URL) return { scheduled: false };
  const target = `${env.NEXT_PUBLIC_SITE_URL}/api/qstash/poll`;
  const publishUrl = qstashPublishUrl(target);
  const scheduleAt = new Date(Date.now() + delaySeconds * 1000);
  // Guard: ensure only one future schedule at a time
  const ok = await repoTryScheduleOnce("global_poll", scheduleAt.toISOString());
  if (!ok) return { scheduled: false };
  const res = await fetch(publishUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.QSTASH_TOKEN}`,
      "Upstash-Delay": `${delaySeconds}s`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    logger.warn("qstash.publish.error", { publishUrl, status: res.status });
    return { scheduled: false, status: res.status } as const;
  }
  return { scheduled: true } as const;
}

export async function qstashScheduleSubmit(taskId: string, delaySeconds = 0) {
  if (!env.QSTASH_TOKEN || !env.NEXT_PUBLIC_SITE_URL) return { scheduled: false } as const;
  const target = `${env.NEXT_PUBLIC_SITE_URL}/api/admin/submit?task_id=${encodeURIComponent(taskId)}`;
  const publishUrl = qstashPublishUrl(target);
  const res = await fetch(publishUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.QSTASH_TOKEN}`,
      ...(delaySeconds > 0 ? { "Upstash-Delay": `${delaySeconds}s` } : {}),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    logger.warn("qstash.publish.error", { publishUrl, status: res.status });
    return { scheduled: false, status: res.status } as const;
  }
  return { scheduled: true } as const;
}

export function calculateBackoff(baseSeconds: number, attempt: number, capSeconds: number) {
  const pow = Math.pow(2, Math.max(0, attempt));
  const raw = Math.min(capSeconds, baseSeconds * pow);
  const jitter = 0.2 * raw;
  const delta = (Math.random() * 2 - 1) * jitter;
  return Math.max(1, Math.floor(raw + delta));
}

export async function qstashScheduleTaskPoll(input: { taskId: string; attempt?: number; delaySeconds?: number }) {
  if (!env.QSTASH_TOKEN || !env.NEXT_PUBLIC_SITE_URL) return { scheduled: false } as const;
  const target = `${env.NEXT_PUBLIC_SITE_URL}/api/qstash/poll/task`;
  const publishUrl = qstashPublishUrl(target);
  const payload = { taskId: input.taskId, attempt: input.attempt ?? 0 };
  const headers: Record<string, string> = {
    Authorization: `Bearer ${env.QSTASH_TOKEN}`,
    "Content-Type": "application/json",
  };
  if (input.delaySeconds && input.delaySeconds > 0) headers["Upstash-Delay"] = `${input.delaySeconds}s`;
  const res = await fetch(publishUrl, { method: "POST", headers, body: JSON.stringify(payload) });
  if (!res.ok) {
    logger.warn("qstash.publish.error", { publishUrl, status: res.status });
    return { scheduled: false, status: res.status } as const;
  }
  return { scheduled: true } as const;
}
