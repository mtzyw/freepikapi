import { createHmac, timingSafeEqual } from "node:crypto";

export function base64urlEncode(buf: Buffer | Uint8Array | string) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf as any);
  return b.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function base64urlDecode(s: string) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return Buffer.from(s, "base64");
}

export function hmacSHA256Hex(secret: string, data: string) {
  return createHmac("sha256", secret).update(data).digest("hex");
}

export function timingSafeEqualHex(a: string, b: string) {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length) return false;
  try { return timingSafeEqual(ba, bb); } catch { return Buffer.compare(ba, bb) === 0; }
}
