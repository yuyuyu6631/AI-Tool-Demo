"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Footer from "@/src/app/components/Footer";
import Header from "@/src/app/components/Header";
import { useAuth } from "@/src/app/components/auth/AuthProvider";
import { fetchMyCandidates, fetchMyMatchProfile, updateMyMatchProfile } from "@/src/app/lib/matchmaking-api";
import type { MatchCandidate, MatchProfile } from "@/src/app/lib/catalog-types";

export default function MatchesPage() {
  const { currentUser, status } = useAuth();
  const [profile, setProfile] = useState<MatchProfile | null>(null);
  const [bioDraft, setBioDraft] = useState("");
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void Promise.all([fetchMyMatchProfile(), fetchMyCandidates(20)])
      .then(([me, peers]) => {
        if (cancelled) return;
        setProfile(me);
        setBioDraft(me.bio || "");
        setCandidates(peers);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const showNotEnabled = Boolean(profile && !profile.isMatchmakingEnabled);
  const showNoTools = Boolean(profile && profile.isMatchmakingEnabled && profile.tools.length === 0);
  const showNoCandidates = Boolean(profile && profile.isMatchmakingEnabled && profile.tools.length > 0 && candidates.length === 0);

  const sharedToolHint = useMemo(() => profile?.tools.slice(0, 6).map((tool) => tool.name).join("、") ?? "", [profile]);

  async function saveProfile(nextEnabled: boolean) {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateMyMatchProfile({ bio: bioDraft, isMatchmakingEnabled: nextEnabled });
      setProfile(updated);
      if (updated.isMatchmakingEnabled) {
        setCandidates(await fetchMyCandidates(20));
      }
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return null;
  }

  if (!currentUser) {
    return (
      <div className="page-shell">
        <Header currentPath="/matches" currentRoute="/matches" />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-slate-950">请先登录再找搭子</h1>
          <Link href="/auth" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">
            去登录
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Header currentPath="/matches" currentRoute="/matches" />
      <main className="py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 sm:px-6 lg:px-8">
          <section className="panel-base rounded-[28px] p-6">
            <h1 className="text-2xl font-semibold text-slate-950">找搭子</h1>
            <p className="mt-3 text-sm text-slate-600">基于你“我在用”的工具，匹配同好用户（至少 1 个共同工具）。</p>

            {loading || !profile ? (
              <p className="mt-4 text-sm text-slate-500">加载中...</p>
            ) : (
              <div className="mt-5 space-y-4">
                <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={profile.isMatchmakingEnabled}
                    onChange={(event) => void saveProfile(event.target.checked)}
                    disabled={saving}
                  />
                  加入找搭子
                </label>

                <textarea
                  value={bioDraft}
                  onChange={(event) => setBioDraft(event.target.value)}
                  placeholder="一句话介绍你怎么用这些工具"
                  className="h-24 w-full rounded-2xl border border-slate-200 bg-white/90 p-3 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => void saveProfile(profile.isMatchmakingEnabled)}
                  disabled={saving}
                  className="btn-primary rounded-full px-4 py-2 text-sm font-medium"
                >
                  {saving ? "保存中..." : "保存设置"}
                </button>
              </div>
            )}
          </section>

          <section className="panel-base rounded-[28px] p-6">
            <h2 className="text-xl font-semibold text-slate-900">我的在用工具</h2>
            {!profile ? null : profile.tools.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">
                你还没有标记任何工具，去工具详情页点击“我在用”。
                <Link href="/tools" className="ml-2 text-slate-900 underline">
                  去工具目录
                </Link>
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.tools.map((tool) => (
                  <span key={tool.id} className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-700">
                    {tool.name}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="panel-base rounded-[28px] p-6">
            <h2 className="text-xl font-semibold text-slate-900">匹配结果</h2>

            {showNotEnabled ? <p className="mt-3 text-sm text-slate-600">先开启“加入找搭子”，我们才会给你推荐同好。</p> : null}
            {showNoTools ? <p className="mt-3 text-sm text-slate-600">请先去工具详情页标记“我在用”。</p> : null}
            {showNoCandidates ? <p className="mt-3 text-sm text-slate-600">当前还没有找到使用相同工具的人。</p> : null}

            {!showNotEnabled && !showNoTools && candidates.length > 0 ? (
              <div className="mt-4 grid gap-4">
                {candidates.map((candidate) => (
                  <article key={candidate.userId} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{candidate.username}</h3>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">匹配分 {candidate.matchScore}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{candidate.bio || "这个用户还没有填写介绍。"}</p>
                    <p className="mt-2 text-sm text-slate-700">共同工具：{candidate.sharedTools.join("、")}</p>
                    {candidate.similarToolPairs.length > 0 ? (
                      <p className="mt-2 text-sm text-slate-700">
                        相似工具：
                        {candidate.similarToolPairs
                          .map((pair) => `${pair.myTool} ↔ ${pair.candidateTool} (${pair.similarity.toFixed(2)})`)
                          .join("；")}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-slate-800">{candidate.reason}</p>
                  </article>
                ))}
              </div>
            ) : null}

            {profile && sharedToolHint && !showNotEnabled ? <p className="mt-4 text-xs text-slate-500">当前你的工具样本：{sharedToolHint}</p> : null}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
