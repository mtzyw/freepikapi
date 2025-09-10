import { redisAvailable, redisDel, redisGet, redisSetNX } from "@/lib/redis";
import { logger } from "@/lib/logger";

export async function acquireLock(key: string, ttlMs: number): Promise<boolean> {
  if (!redisAvailable()) return true; // no redis → best-effort single instance
  try {
    const ok = await redisSetNX(key, `${Date.now()}`, ttlMs);
    if (ok === true) return true;
    // ok === false (or falsy) — differentiate held vs degraded
    try {
      const val = await redisGet(key);
      if (val) {
        logger.info("lock.held", { key });
        return false; // another worker holds the lock
      }
      // No value found → treat as degraded Redis condition and proceed to avoid stalls
      logger.warn("lock.degraded.proceed", { key });
      return true;
    } catch (e2) {
      logger.warn("lock.get.error.degraded", { key, error: String((e2 as any)?.message || e2) });
      return true;
    }
  } catch (e) {
    logger.warn("lock.acquire.error.degraded", { key, error: String((e as any)?.message || e) });
    return true;
  }
}

export async function releaseLock(key: string): Promise<void> {
  if (!redisAvailable()) return;
  try {
    await redisDel(key);
  } catch {
    // ignore
  }
}

export async function withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T | undefined> {
  const ok = await acquireLock(key, ttlMs);
  if (!ok) return undefined;
  try {
    return await fn();
  } finally {
    await releaseLock(key);
  }
}
