import { env } from "@/lib/env";

type ImageTaskInput = {
  prompt: string;
  webhookUrl: string;
  apiKey: string;
  extras?: Record<string, unknown>;
};

type VideoTaskInput = {
  prompt: string;
  firstFrameImage?: string;
  duration?: number;
  webhookUrl: string;
  apiKey: string;
  extras?: Record<string, unknown>;
};

export async function createImageTask(input: ImageTaskInput) {
  if (env.MOCK_FREEPIK) {
    return { task_id: `fp_${Math.random().toString(36).slice(2)}`, status: "IN_PROGRESS" };
  }
  const url = `${env.FREEPIK_BASE_URL}/v1/ai/mystic`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-freepik-api-key": input.apiKey,
    },
    body: JSON.stringify({ prompt: input.prompt, webhook_url: input.webhookUrl, ...(input.extras || {}) }),
  });
  if (!res.ok) throw new Error(`Freepik image task failed: ${res.status}`);
  const data = await res.json();
  return { task_id: data?.data?.task_id ?? data?.task_id, status: data?.data?.status ?? data?.status };
}

export async function createVideoTask(input: VideoTaskInput) {
  if (env.MOCK_FREEPIK) {
    return { task_id: `fp_${Math.random().toString(36).slice(2)}`, status: "IN_PROGRESS" };
  }
  const url = `${env.FREEPIK_BASE_URL}/v1/ai/image-to-video/minimax`;
  const body: Record<string, unknown> = {
    prompt: input.prompt,
    webhook_url: input.webhookUrl,
    ...(input.firstFrameImage ? { first_frame_image: input.firstFrameImage } : {}),
    ...(input.duration ? { duration: input.duration } : {}),
    ...(input.extras || {}),
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-freepik-api-key": input.apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Freepik video task failed: ${res.status}`);
  const data = await res.json();
  return { task_id: data?.data?.task_id ?? data?.task_id, status: data?.data?.status ?? data?.status };
}

export async function getTaskStatus(taskId: string, apiKey: string) {
  if (env.MOCK_FREEPIK) {
    return { status: "COMPLETED", generated: ["https://example.com/mock.jpg"] };
  }
  const url = `${env.FREEPIK_BASE_URL}/v1/ai/mystic/${taskId}`;
  const res = await fetch(url, { headers: { "x-freepik-api-key": apiKey } });
  if (!res.ok) throw new Error(`Freepik status failed: ${res.status}`);
  const data = await res.json();
  return { status: data?.data?.status ?? data?.status, generated: data?.data?.generated ?? data?.generated };
}
