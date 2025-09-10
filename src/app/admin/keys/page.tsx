import { assertSupabase } from "@/lib/supabase";
import crypto from "node:crypto";

async function listFreepikKeys() {
  const supabase = assertSupabase();
  const { data } = await (supabase as any)
    .from("api_keys")
    .select("id,label,active,daily_limit,last_used_at,created_at")
    .order("created_at", { ascending: false });
  return data || [];
}

async function listProxyKeys() {
  const supabase = assertSupabase();
  const { data } = await (supabase as any)
    .from("proxy_keys")
    .select("id,label,active,last_used_at,created_at")
    .order("created_at", { ascending: false });
  return data || [];
}

async function createFreepikKey(formData: FormData) {
  "use server";
  const supabase = assertSupabase();
  const label = String(formData.get("label") || "").trim() || null;
  const key = String(formData.get("key") || "").trim();
  const dailyLimit = Number(formData.get("daily_limit") || 10000);
  if (!key) throw new Error("missing key");
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");
  const { error } = await (supabase as any)
    .from("api_keys")
    .insert({ provider: "freepik", label, key_cipher: key, key_hash: keyHash, daily_limit: dailyLimit, active: true });
  if (error) throw error;
}

function genToken() {
  return "pk_" + crypto.randomBytes(24).toString("hex");
}

async function createProxyKey(formData: FormData) {
  "use server";
  const supabase = assertSupabase();
  const label = String(formData.get("label") || "").trim() || null;
  const token = genToken();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const { error } = await (supabase as any)
    .from("proxy_keys")
    .insert({ label, token_cipher: token, token_hash: tokenHash, active: true });
  if (error) throw error;
}

export default async function KeysPage() {
  const [freepikKeys, proxyKeys] = await Promise.all([
    listFreepikKeys(),
    listProxyKeys(),
  ]);
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">密钥管理</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Freepik Keys</h2>
        <form action={createFreepikKey} className="flex gap-2 items-end flex-wrap border p-3 rounded">
          <div className="flex flex-col">
            <label className="text-sm">Label</label>
            <input name="label" className="border rounded px-2 py-1" placeholder="主Key-1" />
          </div>
          <div className="flex flex-col min-w-72">
            <label className="text-sm">Freepik API Key</label>
            <input name="key" className="border rounded px-2 py-1 w-full" placeholder="FPSX..." />
          </div>
          <div className="flex flex-col">
            <label className="text-sm">Daily Limit</label>
            <input name="daily_limit" type="number" className="border rounded px-2 py-1 w-28" defaultValue={10000} />
          </div>
          <button type="submit" className="border rounded px-3 py-1 bg-black text-white">添加</button>
        </form>
        <div className="border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2">Label</th>
                <th className="p-2">Active</th>
                <th className="p-2">Daily Limit</th>
                <th className="p-2">Last Used</th>
                <th className="p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {freepikKeys.map((k: any) => (
                <tr key={k.id} className="border-t">
                  <td className="p-2">{k.label || "-"}</td>
                  <td className="p-2">{k.active ? "true" : "false"}</td>
                  <td className="p-2">{k.daily_limit ?? 0}</td>
                  <td className="p-2">{k.last_used_at || "-"}</td>
                  <td className="p-2">{k.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">中转站访问 Key</h2>
        <form action={createProxyKey} className="flex gap-2 items-end flex-wrap border p-3 rounded">
          <div className="flex flex-col">
            <label className="text-sm">Label</label>
            <input name="label" className="border rounded px-2 py-1" placeholder="站点A-访问Key" />
          </div>
          <button type="submit" className="border rounded px-3 py-1 bg-black text-white">生成一把</button>
          <div className="text-sm text-gray-500">生成后可在数据库中查看明文 token（当前未加密存储）。</div>
        </form>
        <div className="border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2">Label</th>
                <th className="p-2">Active</th>
                <th className="p-2">Last Used</th>
                <th className="p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {proxyKeys.map((k: any) => (
                <tr key={k.id} className="border-t">
                  <td className="p-2">{k.label || "-"}</td>
                  <td className="p-2">{k.active ? "true" : "false"}</td>
                  <td className="p-2">{k.last_used_at || "-"}</td>
                  <td className="p-2">{k.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

