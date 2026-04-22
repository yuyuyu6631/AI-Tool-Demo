import AdminShell from "@/src/app/components/admin/AdminShell";
import AdminReviewsManager from "@/src/app/components/admin/AdminReviewsManager";


export default function Page() {
  return (
    <AdminShell currentPath="/admin/reviews" title="评论管理" description="查看用户与编辑评论，并删除不合规内容。">
      <AdminReviewsManager />
    </AdminShell>
  );
}
