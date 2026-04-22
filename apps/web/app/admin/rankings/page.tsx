import AdminShell from "@/src/app/components/admin/AdminShell";
import AdminRankingsManager from "@/src/app/components/admin/AdminRankingsManager";


export default function Page() {
  return (
    <AdminShell currentPath="/admin/rankings" title="榜单管理" description="配置首页榜单区的榜单与工具排序。">
      <AdminRankingsManager />
    </AdminShell>
  );
}
