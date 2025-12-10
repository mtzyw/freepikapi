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

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("zh-CN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
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
            {rows.length === 0 ? (
              <tr><td className="p-3 text-center text-gray-500" colSpan={7}>暂无任务</td></tr>
            ) : rows.map((t: any) => (
              <tr key={t.id} className="border-t">
                <td className="p-2 font-mono">{t.id}</td>
                <td className="p-2">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                    {t.status}
                  </span>
                </td>
                <td className="p-2">{t.model || '-'}</td>
                <td className="p-2 font-mono">{t.freepik_task_id || '-'}</td>
                <td className="p-2">{formatDate(t.created_at)}</td>
                <td className="p-2">{formatDate(t.started_at)}</td>
                <td className="p-2">{formatDate(t.completed_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-gray-500">显示最近 100 条；详细结果可在数据库 tasks/result_urls 与 assets 表查看。</div>
    </div>
  );
}
