import AdminShell from "@/src/app/components/admin/AdminShell";
import AdminToolEditor from "@/src/app/components/admin/AdminToolEditor";


export default function Page() {
  return (
    <AdminShell currentPath="/admin/tools" title="新建工具" description="录入新的 AI 工具卡片并设置默认发布信息。">
      <AdminToolEditor />
    </AdminShell>
  );
}
