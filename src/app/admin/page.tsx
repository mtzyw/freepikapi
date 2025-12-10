import { assertSupabase } from "@/lib/supabase";

async function getStats() {
  const supabase = assertSupabase();
  const [{ count: c1 }, { count: c2 }, { count: c3 }] = await Promise.all([
    (supabase as any).from("tasks").select("count(*)", { count: "exact", head: true }).eq("status", "IN_PROGRESS"),
    (supabase as any).from("tasks").select("count(*)", { count: "exact", head: true }).eq("status", "COMPLETED"),
    (supabase as any).from("api_keys").select("count(*)", { count: "exact", head: true }).eq("active", true),
  ]);
  return {
    inProgress: c1 ?? 0,
    completed: c2 ?? 0,
    activeKeys: c3 ?? 0,
  };
}

export default async function AdminHome() {
  const s = await getStats().catch(() => ({ inProgress: 0, completed: 0, activeKeys: 0 }));
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">概览</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded p-4"><div className="text-sm text-gray-500">进行中</div><div className="text-2xl">{(s as any).inProgress ?? 0}</div></div>
        <div className="border rounded p-4"><div className="text-sm text-gray-500">已完成</div><div className="text-2xl">{(s as any).completed ?? 0}</div></div>
        <div className="border rounded p-4"><div className="text-sm text-gray-500">Active Freepik Keys</div><div className="text-2xl">{(s as any).activeKeys ?? 0}</div></div>
      </div>
      <div className="text-sm text-gray-500">使用侧边栏进入“密钥管理”和“任务记录”。</div>
    </div>
  );
}
