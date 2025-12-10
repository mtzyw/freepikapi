import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { assertSupabase } from "@/lib/supabase";
import KeysClient from "./KeysClient";
import type { KeysActionState } from "./types";

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

async function createFreepikKey(_: KeysActionState, formData: FormData): Promise<KeysActionState> {
  "use server";
  const supabase = assertSupabase();
  try {
    const label = String(formData.get("label") || "").trim() || null;
    const key = String(formData.get("key") || "").trim();
    const dailyLimit = Number(formData.get("daily_limit") || 10000);
    if (!key) throw new Error("请填写 Freepik API Key");
    const keyHash = crypto.createHash("sha256").update(key).digest("hex");
    const { error } = await (supabase as any)
      .from("api_keys")
      .insert({ provider: "freepik", label, key_cipher: key, key_hash: keyHash, daily_limit: dailyLimit, active: true });
    if (error) throw error;
    revalidatePath("/admin/keys");
    return { status: "ok", message: "已添加 Freepik Key" };
  } catch (err: any) {
    return { status: "error", message: err?.message || "保存失败" };
  }
}

function genToken() {
  return "pk_" + crypto.randomBytes(24).toString("hex");
}

async function createProxyKey(_: KeysActionState, formData: FormData): Promise<KeysActionState> {
  "use server";
  const supabase = assertSupabase();
  try {
    const label = String(formData.get("label") || "").trim() || null;
    const token = genToken();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const { error } = await (supabase as any)
      .from("proxy_keys")
      .insert({ label, token_cipher: token, token_hash: tokenHash, active: true });
    if (error) throw error;
    revalidatePath("/admin/keys");
    return { status: "ok", message: "已生成访问 Key", token };
  } catch (err: any) {
    return { status: "error", message: err?.message || "生成失败" };
  }
}

export default async function KeysPage() {
  const [freepikKeys, proxyKeys] = await Promise.all([
    listFreepikKeys(),
    listProxyKeys(),
  ]);
  return (
    <KeysClient
      freepikKeys={freepikKeys}
      proxyKeys={proxyKeys}
      createFreepikKey={createFreepikKey}
      createProxyKey={createProxyKey}
    />
  );
}
