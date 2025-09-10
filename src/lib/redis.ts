import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

let _client: Redis | null = null;

function getRedisClient(): Redis {
  if (_client) return _client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash Redis env not configured");
  _client = new Redis({ url, token });
  return _client;
}

export async function redisSetNX(key: string, value: string, ttlMs: number): Promise<boolean> {
  try {
    const client = getRedisClient();
    const res = await client.set(key, value, { nx: true, px: ttlMs });
    return Boolean(res);
  } catch (e) {
    logger.warn("redis.setnx.error", { key, error: String((e as any)?.message || e) });
    return false;
  }
}

export async function redisDel(key: string): Promise<number> {
  try {
    const client = getRedisClient();
    const res = await client.del(key);
    return Number(res) || 0;
  } catch (e) {
    logger.warn("redis.del.error", { key, error: String((e as any)?.message || e) });
    return 0;
  }
}

export async function redisGet(key: string): Promise<string | null> {
  try {
    const client = getRedisClient();
    const res = await client.get<string>(key);
    return (res as any) ?? null;
  } catch (e) {
    logger.warn("redis.get.error", { key, error: String((e as any)?.message || e) });
    return null;
  }
}

export async function redisSetEx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
  try {
    const client = getRedisClient();
    const res = await client.set(key, value, { ex: ttlSeconds });
    return Boolean(res);
  } catch (e) {
    logger.warn("redis.setex.error", { key, error: String((e as any)?.message || e) });
    return false;
  }
}

export function redisAvailable() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
