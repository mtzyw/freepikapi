export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r p-4 space-y-3">
        <div className="font-semibold text-lg">中控台</div>
        <nav className="space-y-2">
          <a className="block hover:underline" href="/admin">概览</a>
          <a className="block hover:underline" href="/admin/keys">密钥管理</a>
          <a className="block hover:underline" href="/admin/tasks">任务记录</a>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

