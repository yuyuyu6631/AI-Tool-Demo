import { useState, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RankingCard from "../components/RankingCard";
import toolsData from "../../data/tools.json";

const tabs = [
  { id: "hot", label: "热门榜", category: null },
  { id: "writing", label: "写作榜", category: "写作办公" },
  { id: "coding", label: "编程榜", category: "编程开发" },
  { id: "agent", label: "智能体平台榜", category: "智能体平台" },
];

const filters = [
  { id: "all", label: "全部" },
  { id: "domestic", label: "国内工具" },
  { id: "international", label: "国外工具" },
  { id: "free", label: "免费优先" },
  { id: "enterprise", label: "企业场景" },
  { id: "beginner", label: "新手友好" },
];

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState("hot");
  const [activeFilter, setActiveFilter] = useState("all");

  // 根据当前标签筛选工具，并使用 useMemo 缓存结果避免每次渲染重复计算
  const filteredTools = useMemo(() => {
    const currentTab = tabs.find((tab) => tab.id === activeTab);
    if (!currentTab) return [];

    if (currentTab.category) {
      return toolsData
        .filter((tool) => tool.category === currentTab.category)
        .sort((a, b) => b.score - a.score);
    }

    // 热门榜按评分排序
    return [...toolsData].sort((a, b) => b.score - a.score);
  }, [activeTab]);

  // 生成推荐理由
  const generateReason = (tool: any, rank: number) => {
    if (rank === 1) {
      return `${tool.name} 在${
        tabs.find((t) => t.id === activeTab)?.label || "榜单"
      }中排名第一，综合评分最高，是该领域的首选工具。`;
    } else if (rank <= 3) {
      return `表现优异，在${tool.tags[0]}等方面有出色表现，值得优先考虑。`;
    } else {
      return `${tool.tags[0]}能力突出，适合${
        tool.targetAudience?.[0] || "专业用户"
      }使用。`;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <Header />

      {/* 页面标题区 */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI 工具榜单</h1>
          <p className="text-gray-600 max-w-3xl">
            基于热度、功能完整度、场景适配度和上手门槛等维度综合评估，为你推荐最值得尝试的
            AI
            工具。榜单每周更新，确保推荐内容的时效性和准确性。所有评测均基于实际使用体验和用户反馈。
          </p>
        </div>
      </section>

      {/* 榜单切换区 */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 筛选区 */}
      <section className="py-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 overflow-x-auto">
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
              筛选：
            </span>
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  activeFilter === filter.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 榜单列表 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                reason={generateReason(tool, index + 1)}
              />
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500">暂无相关工具</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
