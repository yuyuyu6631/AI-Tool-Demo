import { Link } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSearchPanel from "../components/HeroSearchPanel";
import ToolCard from "../components/ToolCard";
import ScenarioCard from "../components/ScenarioCard";
import {
  Sparkles,
  FileText,
  Code,
  Palette,
  Video,
  BarChart,
  Bot,
  TrendingUp,
  Zap,
  Target,
  Briefcase,
} from "lucide-react";
import toolsData from "../../data/tools.json";
import scenariosData from "../../data/scenarios.json";

const categories = [
  { name: "通用助手", icon: <Sparkles className="w-6 h-6 text-white" /> },
  { name: "写作办公", icon: <FileText className="w-6 h-6 text-white" /> },
  { name: "编程开发", icon: <Code className="w-6 h-6 text-white" /> },
  { name: "设计绘图", icon: <Palette className="w-6 h-6 text-white" /> },
  { name: "视频音频", icon: <Video className="w-6 h-6 text-white" /> },
  { name: "数据分析", icon: <BarChart className="w-6 h-6 text-white" /> },
  { name: "智能体平台", icon: <Bot className="w-6 h-6 text-white" /> },
];

const rankingEntries = [
  {
    slug: "hot",
    title: "本周热门 AI 工具",
    description: "最受欢迎的 AI 工具，综合热度和用户反馈",
    icon: <TrendingUp className="w-6 h-6 text-white" />,
  },
  {
    slug: "writing",
    title: "最强 AI 写作助手",
    description: "专注内容创作和文案生成的 AI 工具",
    icon: <FileText className="w-6 h-6 text-white" />,
  },
  {
    slug: "agent",
    title: "热门智能体平台推荐",
    description: "快速搭建和部署 AI 应用的平台",
    icon: <Bot className="w-6 h-6 text-white" />,
  },
  {
    slug: "domestic",
    title: "国内可用 AI 办公工具合集",
    description: "国内访问流畅的 AI 办公效率工具",
    icon: <Zap className="w-6 h-6 text-white" />,
  },
];

const scenarios = scenariosData.slice(0, 4).map((scenario) => ({
  slug: scenario.slug,
  title: scenario.title,
  description: scenario.description,
  toolCount: scenario.toolCount,
  icon: getScenarioIcon(scenario.slug),
}));

function getScenarioIcon(slug: string) {
  const iconMap: Record<string, React.ReactNode> = {
    ppt: <FileText className="w-6 h-6 text-white" />,
    writing: <Target className="w-6 h-6 text-white" />,
    "data-analysis": <BarChart className="w-6 h-6 text-white" />,
    "agent-platform": <Briefcase className="w-6 h-6 text-white" />,
  };
  return iconMap[slug] || <Sparkles className="w-6 h-6 text-white" />;
}

export default function HomePage() {
  // 获取推荐工具（前8个）
  const recommendedTools = toolsData.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <Header />

      {/* Hero 首屏 */}
      <section className="bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#334155] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 左侧文案 */}
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                发现真正好用的
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  AI 工具与智能体
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                热门工具评测、榜单推荐、场景选型，一站看懂 AI 产品怎么选
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/rankings"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                  浏览榜单
                </Link>
                <Link
                  to="/scenarios"
                  className="px-6 py-3 bg-white/10 backdrop-blur text-white rounded-xl hover:bg-white/20 transition border border-white/20"
                >
                  场景推荐
                </Link>
              </div>
            </div>

            {/* 右侧 AI 搜索 */}
            <div>
              <HeroSearchPanel />
            </div>
          </div>
        </div>
      </section>

      {/* 热门榜单入口 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">热门榜单</h2>
            <p className="text-gray-600">
              基于热度、功能完整度、场景适配度和上手门槛综合评估
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rankingEntries.map((entry, index) => (
              <Link key={index} to="/rankings">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                    {entry.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {entry.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{entry.description}</p>
                  <span className="text-blue-600 text-sm font-medium">
                    查看榜单 →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 工具分类区 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">按分类浏览</h2>
            <p className="text-gray-600">根据使用场景快速找到合适的 AI 工具</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mb-3">
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 推荐工具区 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">精选推荐</h2>
            <p className="text-gray-600">编辑精选的优质 AI 工具，帮你快速上手</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedTools.map((tool) => (
              <ToolCard
                key={tool.slug}
                slug={tool.slug}
                name={tool.name}
                summary={tool.summary}
                tags={tool.tags}
                score={tool.score}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/rankings"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              查看更多工具
            </Link>
          </div>
        </div>
      </section>

      {/* 场景推荐区 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">场景推荐</h2>
            <p className="text-gray-600">按使用场景为你推荐最合适的工具组合</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.slug}
                slug={scenario.slug}
                title={scenario.title}
                description={scenario.description}
                toolCount={scenario.toolCount}
                icon={scenario.icon}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/scenarios"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              查看所有场景
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}