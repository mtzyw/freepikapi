"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import type { KeysActionState } from "./types";

type FreepikKey = {
  id: string;
  label: string | null;
  active: boolean;
  daily_limit: number | null;
  last_used_at: string | null;
  created_at: string;
};

type ProxyKey = {
  id: string;
  label: string | null;
  active: boolean;
  last_used_at: string | null;
  created_at: string;
};

type Props = {
  freepikKeys: FreepikKey[];
  proxyKeys: ProxyKey[];
  createFreepikKey: (prevState: KeysActionState, formData: FormData) => Promise<KeysActionState>;
  createProxyKey: (prevState: KeysActionState, formData: FormData) => Promise<KeysActionState>;
};

const initialState: KeysActionState = { status: "idle" };

function ActionButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="border rounded px-3 py-1 bg-black text-white disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "处理中..." : children}
    </button>
  );
}

function CopyToken({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-mono break-all">{token}</span>
      <button
        type="button"
        className="border rounded px-2 py-0.5 text-xs"
        onClick={async () => {
          await navigator.clipboard?.writeText(token);
          setCopied(true);
        }}
      >
        {copied ? "已复制" : "复制"}
      </button>
    </div>
  );
}

export default function KeysClient({ freepikKeys, proxyKeys, createFreepikKey, createProxyKey }: Props) {
  const [fpState, fpAction] = useFormState(createFreepikKey, initialState);
  const [proxyState, proxyAction] = useFormState(createProxyKey, initialState);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">密钥管理</h1>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Freepik Keys</h2>
          {fpState.message ? (
            <div className={`text-sm ${fpState.status === "error" ? "text-red-600" : "text-green-700"}`}>
              {fpState.message}
            </div>
          ) : null}
        </div>
        <form action={fpAction} className="flex gap-2 items-end flex-wrap border p-3 rounded bg-gray-50">
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
          <ActionButton>添加</ActionButton>
        </form>
        <div className="border rounded overflow-auto">
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
              {freepikKeys.length === 0 ? (
                <tr><td className="p-3 text-center text-gray-500" colSpan={5}>暂无 Freepik Key</td></tr>
              ) : (
                freepikKeys.map((k) => (
                  <tr key={k.id} className="border-t">
                    <td className="p-2">{k.label || "-"}</td>
                    <td className="p-2">{k.active ? "true" : "false"}</td>
                    <td className="p-2">{k.daily_limit ?? 0}</td>
                    <td className="p-2">{k.last_used_at || "-"}</td>
                    <td className="p-2">{k.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">中转站访问 Key</h2>
          {proxyState.message ? (
            <div className={`text-sm ${proxyState.status === "error" ? "text-red-600" : "text-green-700"}`}>
              {proxyState.message}
            </div>
          ) : null}
        </div>
        <form action={proxyAction} className="flex gap-2 items-end flex-wrap border p-3 rounded bg-gray-50">
          <div className="flex flex-col">
            <label className="text-sm">Label</label>
            <input name="label" className="border rounded px-2 py-1" placeholder="站点A-访问Key" />
          </div>
          <ActionButton>生成一把</ActionButton>
          <div className="text-sm text-gray-500">生成后即刻展示 token（仅此一次）；同时会写入数据库。</div>
        </form>
        {proxyState.token ? (
          <div className="p-3 border rounded bg-green-50 text-sm space-y-1">
            <div className="font-medium">新生成的 token：</div>
            <CopyToken token={proxyState.token} />
            <div className="text-gray-500">请立即保存，该值不会再次显示。</div>
          </div>
        ) : null}
        <div className="border rounded overflow-auto">
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
              {proxyKeys.length === 0 ? (
                <tr><td className="p-3 text-center text-gray-500" colSpan={4}>暂无中转站访问 Key</td></tr>
              ) : (
                proxyKeys.map((k) => (
                  <tr key={k.id} className="border-t">
                    <td className="p-2">{k.label || "-"}</td>
                    <td className="p-2">{k.active ? "true" : "false"}</td>
                    <td className="p-2">{k.last_used_at || "-"}</td>
                    <td className="p-2">{k.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
