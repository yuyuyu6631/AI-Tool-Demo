import AdminShell from "@/src/app/components/admin/AdminShell";
import AdminToolsList from "@/src/app/components/admin/AdminToolsList";


export default function Page() {
  return (
    <AdminShell currentPath="/admin/tools" title="工具维护" description="维护 AI 工具基础信息、发布状态、标签、价格与访问条件。">
      <AdminToolsList />
    </AdminShell>
  );
}
