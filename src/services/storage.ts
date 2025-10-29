import { randomUUID } from "crypto";

import { r2Enabled, r2HeadObject, r2UploadFromUrl } from "@/lib/r2";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { assertSupabase } from "@/lib/supabase";

function isHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function storeResultsToR2(taskId: string, urls: string[]) {
  if (!urls || urls.length === 0) return [] as any[];
  if (!r2Enabled()) return [] as any[];
  const supabase = env.R2_RECORD_ASSETS ? assertSupabase() : null as any;
  const objects: any[] = [];
  for (const url of urls) {
    try {
      if (!isHttpUrl(url)) {
        logger.debug("r2.upload.skip_non_url", { taskId, value: url });
        continue;
      }
      const ext = (() => {
        try {
          const u = new URL(url);
          const pathname = u.pathname || "";
          const m = pathname.match(/\.([a-zA-Z0-9]+)(?:$|\?)/);
          return m ? m[1] : "bin";
        } catch {
          return "bin";
        }
      })();
      const slug = randomUUID().replace(/-/g, "");
      const key = `tasks/${taskId}/${slug}.${ext}`;

      // Skip if already exists
      const exists = await r2HeadObject(key);
      if (!exists) {
        const uploaded = await r2UploadFromUrl(url, key);
        const public_url = (() => {
          if (!env.R2_PUBLIC_BASE_URL) return undefined;
          const base = env.R2_PUBLIC_BASE_URL.replace(/\/$/, "");
          return `${base}/${key}`;
        })();
        const record = { ...uploaded, source_url: url, public_url } as any;
        logger.info("r2.asset.ready", { taskId, key: record.key, public_url: record.public_url });
        objects.push(record);
      }
    } catch {
      // Log and continue with others
      logger.warn("r2.upload.failed", { taskId, url });
    }
  }

  if (objects.length > 0 && env.R2_RECORD_ASSETS) {
    try {
      await (supabase as any).from("assets").insert(
        objects.map((o) => ({
          task_id: taskId,
          source_url: o.source_url,
          bucket: o.bucket,
          object_key: o.key,
          public_url: o.public_url || null,
          content_type: o.contentType || null,
          size_bytes: o.size || null,
          etag: o.etag || null,
        }))
      );
    } catch (e) {
      logger.error("r2.assets.insert.error", { taskId, error: String((e as any)?.message || e) });
    }
  }

  return objects;
}
