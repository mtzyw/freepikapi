import { repoVerifyProxyKey } from "@/repo/supabaseRepo";

function getHeader(req: Request, name: string) {
  return req.headers.get(name) || req.headers.get(name.toLowerCase()) || req.headers.get(name.toUpperCase());
}

export async function requireProxyAuth(req: Request): Promise<void> {
  // Try Authorization: Bearer <token> or x-proxy-key: <token>
  const auth = getHeader(req, "authorization");
  const keyHeader = getHeader(req, "x-proxy-key");
  let token: string | null = null;
  if (auth && auth.toLowerCase().startsWith("bearer ")) token = auth.slice(7).trim();
  if (!token && keyHeader) token = keyHeader.trim();
  if (!token) throw new Error("missing_proxy_key");
  const ok = await repoVerifyProxyKey(token);
  if (!ok) throw new Error("invalid_proxy_key");
}

