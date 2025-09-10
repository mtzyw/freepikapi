const PRIVATE_IP_RANGES = [
  /^127\./, // loopback v4
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
];

export function isSafeCallbackUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") return false;
    // If hostname is IPv4, block private ranges by regex
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      if (PRIVATE_IP_RANGES.some((re) => re.test(host))) return false;
    }
    return true;
  } catch {
    return false;
  }
}

