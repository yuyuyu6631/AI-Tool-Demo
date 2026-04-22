"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminTools } from "../../lib/catalog-api";
import type { AdminToolListItem } from "../../lib/catalog-types";

export default function AdminToolsList() {
  const [items, setItems] = useState<AdminToolListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchAdminTools()
      .then((data) => {
        setItems(data);
        setError(null);
      })
      .catch(() => setError("鍔犺浇宸ュ叿鍒楄〃澶辫触锛岃绋嶅悗閲嶈瘯銆?"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-500">姝ｅ湪鍔犺浇宸ュ叿鍒楄〃...</div>;
  }

  if (error) {
    return <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600">{error}</div>;
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">宸ュ叿鍒楄〃</h2>
        <Link href="/admin/tools/new" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          鏂板缓宸ュ叿
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="px-3 py-2">鍚嶇О</th>
              <th className="px-3 py-2">鍒嗙被</th>
              <th className="px-3 py-2">鐘舵€?</th>
              <th className="px-3 py-2">璇勫垎</th>
              <th className="px-3 py-2">璇勮鏁?</th>
              <th className="px-3 py-2">鎿嶄綔</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-3 py-3">
                  <div className="font-medium text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.slug}</div>
                </td>
                <td className="px-3 py-3 text-slate-700">{item.categoryName}</td>
                <td className="px-3 py-3 text-slate-700">{item.status}</td>
                <td className="px-3 py-3 text-slate-700">{item.score.toFixed(2)}</td>
                <td className="px-3 py-3 text-slate-700">{item.reviewCount}</td>
                <td className="px-3 py-3">
                  <Link href={`/admin/tools/${item.id}`} className="font-medium text-slate-900">
                    缂栬緫
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={6}>
                  鏆傛棤宸ュ叿鏁版嵁
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
