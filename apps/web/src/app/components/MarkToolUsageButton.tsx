"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addMyToolUsage, fetchMyMatchProfile, removeMyToolUsage } from "@/src/app/lib/matchmaking-api";
import { useAuth } from "./auth/AuthProvider";

interface MarkToolUsageButtonProps {
  toolId: number;
}

export default function MarkToolUsageButton({ toolId }: MarkToolUsageButtonProps) {
  const { currentUser, status } = useAuth();
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setActive(false);
      return;
    }

    let cancelled = false;
    void fetchMyMatchProfile()
      .then((profile) => {
        if (cancelled) return;
        setActive(profile.tools.some((tool) => tool.id === toolId));
      })
      .catch(() => {
        if (!cancelled) setActive(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser, toolId]);

  if (status === "loading") {
    return (
      <button type="button" disabled className="btn-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium">
        加载中...
      </button>
    );
  }

  if (!currentUser) {
    return (
      <Link href="/auth" className="btn-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium">
        登录后标记我在用
      </Link>
    );
  }

  async function toggleUsage() {
    setLoading(true);
    try {
      const profile = active ? await removeMyToolUsage(toolId) : await addMyToolUsage(toolId);
      setActive(profile.tools.some((tool) => tool.id === toolId));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void toggleUsage()}
      className="btn-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium"
    >
      {loading ? "处理中..." : active ? "取消我在用" : "我在用"}
    </button>
  );
}
