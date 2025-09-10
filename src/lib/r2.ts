import { env } from "@/lib/env";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "node:stream";
import { logger } from "@/lib/logger";
import { setTimeout as sleep } from "node:timers/promises";
import { withDownloadPermit, withUploadPermit } from "@/lib/concurrency";

export function r2Enabled() {
  return Boolean(env.R2_ENDPOINT && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET);
}

export function createR2Client() {
  if (!r2Enabled()) throw new Error("R2 is not configured");
  let endpoint = env.R2_ENDPOINT as string;
  if (endpoint.includes("http")) {
    // Keep only origin; strip any accidental path suffix like '/api'
    try {
      const u = new URL(endpoint);
      endpoint = u.origin;
    } catch {
      // leave as-is
    }
  } else {
    endpoint = `https://${env.R2_ACCOUNT_ID}.${endpoint}`;
  }
  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID as string,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY as string,
    },
    forcePathStyle: false,
  });
  logger.debug("r2.client.init", { endpoint, bucket: env.R2_BUCKET });
  return client;
}

function toNodeReadable(body: any): Readable {
  if (!body) throw new Error("Empty body");
  // Web stream in Node 18+
  if (typeof (body as any).getReader === "function" && (Readable as any).fromWeb) {
    return (Readable as any).fromWeb(body);
  }
  // Already a Node Readable
  if (typeof body.pipe === "function") return body as Readable;
  throw new Error("Unsupported response body type for streaming upload");
}

export async function r2HeadObject(key: string): Promise<boolean> {
  const s3 = createR2Client();
  try {
    await s3.send(new HeadObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function r2UploadStream(params: {
  key: string;
  body: Readable;
  contentType?: string;
  partSizeBytes?: number;
}) {
  const s3 = createR2Client();
  const partSize = params.partSizeBytes ?? 8 * 1024 * 1024; // 8MB parts
  const uploader = new Upload({
    client: s3,
    params: {
      Bucket: env.R2_BUCKET,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType || "application/octet-stream",
    },
    queueSize: 4,
    partSize,
    leavePartsOnError: false,
  });
  logger.info("r2.upload.start", { bucket: env.R2_BUCKET, key: params.key, contentType: params.contentType, partSize });
  const result = await uploader.done().catch((e) => {
    logger.error("r2.upload.error", { bucket: env.R2_BUCKET, key: params.key, error: String(e?.message || e) });
    throw e;
  });
  logger.info("r2.upload.done", { bucket: env.R2_BUCKET, key: params.key, etag: (result as any)?.ETag });
  return result;
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms).unref?.();
  try {
    return await fetch(url, { signal: ac.signal });
  } finally {
    clearTimeout(t as any);
  }
}

export async function r2UploadFromUrl(url: string, key: string): Promise<{
  key: string;
  bucket: string;
  contentType?: string | null;
  size?: number | null;
  etag?: string | undefined;
}> {
  logger.info("r2.download.fetch", { url, key });
  // 控制外部下载并发 + 简单有限重试 + 超时
  let resObj: Response | null = null;
  let lastErr: any;
  await withDownloadPermit(async () => {
    for (let i = 0; i < 3; i++) {
      try {
        const r = await fetchWithTimeout(url, 20_000);
        if (r.ok) { resObj = r; break; }
        lastErr = new Error(`status_${r.status}`);
      } catch (e) {
        lastErr = e;
      }
      await sleep(200 * Math.pow(2, i));
    }
  });
  if (!resObj) throw lastErr;
  const _res: any = resObj as any;
  if (!_res.ok) {
    logger.error("r2.download.bad_status", { url, status: _res.status });
    throw new Error(`download_failed ${_res.status}`);
  }
  const res = _res as Response;
  // 依据文件扩展名兜底/纠正 Content-Type（上游有时会返回错误的 jpeg）
  const ext = (() => {
    const m = key.toLowerCase().match(/\.([a-z0-9]+)$/);
    return m ? m[1] : null;
  })();
  const headerCt = (res.headers.get("content-type") || "").split(";")[0].trim() || null;
  const mimeFromExt = (() => {
    switch (ext) {
      case "png": return "image/png";
      case "jpg":
      case "jpeg": return "image/jpeg";
      case "webp": return "image/webp";
      case "gif": return "image/gif";
      case "bmp": return "image/bmp";
      case "svg": return "image/svg+xml";
      case "mp4": return "video/mp4";
      case "mov": return "video/quicktime";
      case "webm": return "video/webm";
      case "json": return "application/json";
      default: return null;
    }
  })();
  const contentType = (() => {
    if (mimeFromExt && !headerCt) return mimeFromExt;
    if (mimeFromExt && headerCt && headerCt !== mimeFromExt) return mimeFromExt;
    return headerCt || undefined;
  })() as string | undefined;
  const body = toNodeReadable(res.body);
  const out = await withUploadPermit(() => r2UploadStream({ key, body, contentType: contentType || undefined } as any));
  const size = Number(res.headers.get("content-length")) || null;
  return { key, bucket: env.R2_BUCKET as string, contentType, size, etag: (out as any)?.ETag };
}
