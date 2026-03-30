import { useMemo, useState } from "react";
import { Link } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RankingCard from "../components/RankingCard";
import Breadcrumbs from "../components/Breadcrumbs";
import toolsData from "../../data/tools.json";

const tabs = [
  { id: "hot", label: "热门榜", category: null },
  { id: "writing", label: "写作榜", category: "写作办公" },
  { id: "coding", label: "编程榜", category: "编程开发" },
  { id: "agent", label: "智能体平台", category: "智能体平台" },
];

const filters = [
  { id: "all", label: "全部" },
  { id: "domestic", label: "国内工具" },
  { id: "international", label: "海外工具" },
  { id: "free", label: "免费优先" },
  { id: "enterprise", label: "企业场景" },
  { id: "beginner", label: "新手友好" },
];

const filterGroups: Record<string, Set<string>> = {
  domestic: new Set(["kimi", "doubao", "coze", "dify", "yuanbao", "baidu-comate"]),
  international: new Set([
    "chatgpt",
    "claude",
    "gamma",
    "cursor",
    "midjourney",
    "notion-ai",
    "copilot",
    "jasper",
    "runway",
    "perplexity",
    "canva-ai",
    "suno",
    "tableau-ai",
  ]),
  free: new Set(["kimi", "doubao", "coze", "dify", "perplexity", "canva-ai"]),
  enterprise: new Set(["dify", "coze", "tableau-ai", "cursor", "copilot"]),
  beginner: new Set(["doubao", "kimi", "gamma", "canva-ai", "chatgpt"]),
};

// ⚡ Bolt: Pre-sort tools data by score once outside the component
// 💡 What: Replaced O(N log N) sorting on every filter change with a single pre-sort.
// 🎯 Why: Array.sort() mutates and takes more time when run repeatedly inside useMemo.
// 📊 Impact: Reduces sorting overhead to zero during render/filter changes (O(N log N) -> O(N)).
const sortedToolsData = [...toolsData].sort((a, b) => b.score - a.score);

function generateReason(tool: any, rank: number, activeTabLabel: string) {
  if (rank === 1) {
    return `${tool.name} 当前位列${activeTabLabel}首位，综合体验和适配度都更稳。`;
  }

  if (rank <= 3) {
    return `在 ${tool.tags[0]} 等能力上表现突出，适合优先纳入候选。`;
  }

  return `${tool.tags[0]}能力较强，适合 ${tool.targetAudience?.[0] || "大多数用户"} 快速上手。`;
}

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState("hot");
  const [activeFilter, setActiveFilter] = useState("all");

  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  const filteredTools = useMemo(() => {
    // ⚡ Bolt: Use the pre-sorted array directly. Array.filter preserves order.
    let items = sortedToolsData;

    if (currentTab.category) {
      items = items.filter((tool) => tool.category === currentTab.category);
    }

    if (activeFilter !== "all") {
      const group = filterGroups[activeFilter];
      if (group) {
        items = items.filter((tool) => group.has(tool.slug));
      }
    }

    return items;
  }, [activeFilter, currentTab.category]);

  return (
    <div className="page-shell">
      <Header />

      <section className="section-band py-12 md:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "首页", to: "/" },
              { label: "榜单" },
            ]}
          />
          <p className="eyebrow text-xs font-medium mb-3">Rankings</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">AI 工具榜单</h1>
          <p className="text-gray-600 max-w-3xl leading-7">
            先按用途快速筛一轮，再进入详情对比优缺点、适用人群和替代方案。我们把高频决策路径尽量做短。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/scenarios"
              className="inline-flex items-center px-5 py-3 btn-secondary rounded-full transition"
            >
              按场景浏览
            </Link>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={activeTab === tab.id}
                className={`filter-chip px-4 py-2.5 mr-2 rounded-full text-sm font-medium whitespace-nowrap border ${
                  activeTab === tab.id
                    ? "bg-white border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 overflow-x-auto">
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">筛选：</span>
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                aria-pressed={activeFilter === filter.id}
                className={`filter-chip px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${
                  activeFilter === filter.id
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-sm text-gray-500">
            当前视图：{currentTab.label}
            {activeFilter !== "all" ? ` / ${filters.find((item) => item.id === activeFilter)?.label}` : ""}
          </div>

          <div className="space-y-6">
            {filteredTools.map((tool, index) => (
              <RankingCard
                key={tool.slug}
                rank={index + 1}
                slug={tool.slug}
                name={tool.name}
                summary={tool.summary}
                tags={tool.tags}
                score={tool.score}
                reason={generateReason(tool, index + 1, currentTab.label)}
              />
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="panel-base rounded-2xl p-8 text-center">
              <p className="text-gray-500">当前筛选下暂时没有结果，建议切换标签或返回全部查看。</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
