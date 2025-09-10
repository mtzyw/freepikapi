import { assertSupabase } from "@/lib/supabase";

async function getStats() {
  const supabase = assertSupabase();
  const [{ data: t1 }, { data: t2 }, { data: t3 }] = await Promise.all([
    (supabase as any).from("tasks").select("count(*)", { count: "exact", head: true }).eq("status", "IN_PROGRESS"),
    (supabase as any).from("tasks").select("count(*)", { count: "exact", head: true }).eq("status", "COMPLETED"),
    (supabase as any).from("api_keys").select("count(*)", { count: "exact", head: true }).eq("active", true),
  ]);
  return {
    inProgress: (t1 as any)?.length === 0 ? 0 : (t1 as any),
    completed: (t2 as any)?.length === 0 ? 0 : (t2 as any),
    activeKeys: (t3 as any)?.length === 0 ? 0 : (t3 as any),
  };
}

export default async function AdminHome() {
  const s = await getStats().catch(() => ({ inProgress: 0, completed: 0, activeKeys: 0 }));
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">概览</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded p-4"><div className="text-sm text-gray-500">进行中</div><div className="text-2xl">{(s as any).inProgress?.count ?? 0}</div></div>
        <div className="border rounded p-4"><div className="text-sm text-gray-500">已完成</div><div className="text-2xl">{(s as any).completed?.count ?? 0}</div></div>
        <div className="border rounded p-4"><div className="text-sm text-gray-500">Active Freepik Keys</div><div className="text-2xl">{(s as any).activeKeys?.count ?? 0}</div></div>
      </div>
      <div className="text-sm text-gray-500">使用侧边栏进入“密钥管理”和“任务记录”。</div>
    </div>
  );
}

