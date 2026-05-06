import AdminMatchPlansManager from "@/src/app/components/admin/AdminMatchPlansManager";
import AdminShell from "@/src/app/components/admin/AdminShell";


export default function Page() {
  return (
    <AdminShell currentPath="/admin/match-plans" title="匹配策略" description="配置角色、场景和关键词触发的实时推荐策略。">
      <AdminMatchPlansManager />
    </AdminShell>
  );
}
