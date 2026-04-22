import AdminShell from "@/src/app/components/admin/AdminShell";
import AdminToolEditor from "@/src/app/components/admin/AdminToolEditor";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminShell currentPath="/admin/tools" title="编辑工具" description="更新工具展示内容、状态、标签与访问条件。">
      <AdminToolEditor toolId={Number(id)} />
    </AdminShell>
  );
}
