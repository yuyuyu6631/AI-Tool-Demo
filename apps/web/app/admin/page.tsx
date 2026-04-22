import AdminShell from "@/src/app/components/admin/AdminShell";
import AdminOverviewDashboard from "@/src/app/components/admin/AdminOverviewDashboard";

export default function Page() {
  return (
    <AdminShell currentPath="/admin" title="后台总览" description="集中查看后台内容状态，并快速进入工具、评论与榜单管理。">
      <AdminOverviewDashboard />
    </AdminShell>
  );
}
