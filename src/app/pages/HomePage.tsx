import type { ReactNode } from "react";
import { Link } from "react-router";
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
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSearchPanel from "../components/HeroSearchPanel";
import ToolCard from "../components/ToolCard";
import ScenarioCard from "../components/ScenarioCard";
import toolsData from "../../data/tools.json";
import scenariosData from "../../data/scenarios.json";

const categories = [
  { name: "通用助手", icon: <Sparkles className="w-5 h-5 text-slate-800" /> },
  { name: "写作办公", icon: <FileText className="w-5 h-5 text-slate-800" /> },
  { name: "编程开发", icon: <Code className="w-5 h-5 text-slate-800" /> },
  { name: "设计绘图", icon: <Palette className="w-5 h-5 text-slate-800" /> },
  { name: "视频音频", icon: <Video className="w-5 h-5 text-slate-800" /> },
  { name: "数据分析", icon: <BarChart className="w-5 h-5 text-slate-800" /> },
  { name: "智能体平台", icon: <Bot className="w-5 h-5 text-slate-800" /> },
];

const rankingEntries = [
  {
    slug: "hot",
    title: "本周热门 AI 工具",
    description: "快速查看近期关注度最高、讨论最热的工具入口。",
    icon: <TrendingUp className="w-5 h-5 text-slate-800" />,
  },
  {
    slug: "writing",
    title: "高频写作工具",
    description: "覆盖文案生成、周报整理、内容润色等常见写作任务。",
    icon: <FileText className="w-5 h-5 text-slate-800" />,
  },
  {
    slug: "agent",
    title: "智能体平台推荐",
    description: "适合知识库、客服问答与企业流程自动化的能力平台。",
    icon: <Bot className="w-5 h-5 text-slate-800" />,
  },
  {
    slug: "domestic",
    title: "国内可用办公工具",
    description: "优先整理更容易上手、注册和落地的常用工具组合。",
    icon: <Zap className="w-5 h-5 text-slate-800" />,
  },
];

// ⚡ Bolt: Hoist static data outside the component to prevent recreating the array on every render
const recommendedTools = toolsData.slice(0, 6);

// ⚡ Bolt: Hoist static icon mapping outside the function to avoid recreating the object on every call
const scenarioIconMap: Record<string, ReactNode> = {
  ppt: <FileText className="w-5 h-5 text-slate-800" />,
  writing: <Target className="w-5 h-5 text-slate-800" />,
  "data-analysis": <BarChart className="w-5 h-5 text-slate-800" />,
  "agent-platform": <Briefcase className="w-5 h-5 text-slate-800" />,
};

function getScenarioIcon(slug: string) {
  return scenarioIconMap[slug] || <Sparkles className="w-5 h-5 text-slate-800" />;
}

const scenarios = scenariosData.slice(0, 4).map((scenario) => ({
  slug: scenario.slug,
  title: scenario.title,
  description: scenario.description,
  toolCount: scenario.toolCount,
  icon: getScenarioIcon(scenario.slug),
}));

export default function HomePage() {
  return (
    <div className="page-shell">
      <div className="glass-orb top-18 left-8 w-44 h-44 bg-orange-200/40" />
      <div className="glass-orb top-36 right-8 w-60 h-60 bg-sky-300/40" />
      <div className="glass-orb bottom-24 left-1/2 w-72 h-72 -translate-x-1/2 bg-emerald-200/25" />

      <Header />

      <section className="hero-shell py-16 md:py-22">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="widget-glass-hero rounded-[34px] px-6 py-7 md:px-10 md:py-10">
            <div className="liquid-panel-outline" aria-hidden="true" />
            <div className="relative z-10 grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
              <div className="pt-2 lg:pr-6">
                <p className="eyebrow text-xs font-medium mb-5">aitoolbox</p>
                <h1 className="glass-section-title text-4xl md:text-[3.8rem] font-semibold tracking-tight leading-[0.96] max-w-3xl mb-6">
                  发现真正好用的 AI 工具与智能体
                </h1>
                <p className="glass-copy text-[17px] leading-8 max-w-2xl mb-10">
                  热门工具评测、榜单推荐、场景选型，一站看懂 AI 产品怎么选。
                </p>

                <div className="flex flex-wrap gap-4 mb-10">
                  <Link
                    to="/rankings"
                    className="px-5 py-3 btn-primary rounded-full transition"
                  >
                    浏览榜单
                  </Link>
                  <Link
                    to="/scenarios"
                    className="px-5 py-3 btn-secondary rounded-full transition"
                  >
                    场景推荐
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="card-base rounded-[26px] p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
                      Today
                    </div>
                    <div className="text-3xl font-semibold text-slate-900 mb-1">1200+</div>
                    <p className="text-sm text-slate-600 leading-6">
                      已沉淀可持续扩展的工具目录，适合继续补充图标、标签与知识库数据。
                    </p>
                  </div>
                  <div className="card-base rounded-[26px] p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
                      Search
                    </div>
                    <div className="text-3xl font-semibold text-slate-900 mb-1">1 句话</div>
                    <p className="text-sm text-slate-600 leading-6">
                      输入工具名或自然语言需求，快速获得更适合当前任务的推荐结果。
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:pt-1">
                <HeroSearchPanel />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-3">
              热门榜单
            </h2>
            <p className="glass-copy max-w-2xl">
              从热门工具榜、写作榜和智能体平台榜切入，更快理解当前值得关注的产品方向。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rankingEntries.map((entry) => (
              <Link
                key={entry.slug}
                to="/rankings"
                className="group block rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                <div className="card-base rounded-[28px] p-6 transition-all duration-200 h-full">
                  <div className="w-12 h-12 icon-tile rounded-2xl flex items-center justify-center mb-4">
                    {entry.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{entry.title}</h3>
                  <p className="text-sm text-slate-600 leading-6 mb-4">{entry.description}</p>
                  <span className="link-subtle text-sm font-medium">查看榜单</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-14 section-band">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-3">
              工具分类
            </h2>
            <p className="glass-copy">
              先按任务方向缩小范围，再进入具体工具比较，更符合真实选型路径。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <div
                key={category.name}
                className="inline-flex items-center gap-3 px-4 py-3 btn-secondary rounded-full cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full icon-tile flex items-center justify-center">
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-slate-900">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-3">
                推荐工具
              </h2>
              <p className="glass-copy max-w-2xl">
                展示当前值得优先了解的工具卡片，包含名称、标签、评分和一句话简介。
              </p>
            </div>
            <Link
              to="/rankings"
              className="inline-flex items-center text-sm font-medium link-subtle"
            >
              查看完整榜单
            </Link>
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
        </div>
      </section>

      <section className="py-14 md:py-16 section-band">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-3">
              场景推荐
            </h2>
            <p className="glass-copy max-w-2xl">
              从“做 PPT 用什么 AI”“写周报用什么 AI”等真实问题出发，快速找到更合适的工具组合。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="mt-10">
            <Link
              to="/scenarios"
              className="inline-flex items-center px-5 py-3 btn-secondary rounded-full transition"
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
