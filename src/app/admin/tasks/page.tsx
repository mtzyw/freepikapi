import { assertSupabase } from "@/lib/supabase";

async function listTasks() {
  const supabase = assertSupabase();
  const { data } = await (supabase as any)
    .from("tasks")
    .select("id,status,model,freepik_task_id,created_at,started_at,completed_at")
    .order("created_at", { ascending: false })
    .limit(100);
  return data || [];
}

export default async function TasksPage() {
  const rows = await listTasks();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">任务记录</h1>
      <div className="border rounded overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Model</th>
              <th className="p-2">Freepik</th>
              <th className="p-2">Created</th>
              <th className="p-2">Started</th>
              <th className="p-2">Completed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t: any) => (
              <tr key={t.id} className="border-t">
                <td className="p-2 font-mono">{t.id}</td>
                <td className="p-2">{t.status}</td>
                <td className="p-2">{t.model || '-'}</td>
                <td className="p-2 font-mono">{t.freepik_task_id || '-'}</td>
                <td className="p-2">{t.created_at}</td>
                <td className="p-2">{t.started_at || '-'}</td>
                <td className="p-2">{t.completed_at || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-gray-500">显示最近 100 条；详细结果可在数据库 tasks/result_urls 与 assets 表查看。</div>
    </div>
  );
}

