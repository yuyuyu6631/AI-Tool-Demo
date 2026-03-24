import Header from "../components/Header";
import Footer from "../components/Footer";
import ScenarioCard from "../components/ScenarioCard";
import {
  FileText,
  Target,
  BarChart,
  Briefcase,
  Video,
  Mail,
  MessageSquare,
  Code,
} from "lucide-react";
import scenariosData from "../../data/scenarios.json";

const iconMap: Record<string, React.ReactNode> = {
  ppt: <FileText className="w-6 h-6 text-white" />,
  writing: <Target className="w-6 h-6 text-white" />,
  "data-analysis": <BarChart className="w-6 h-6 text-white" />,
  "agent-platform": <Briefcase className="w-6 h-6 text-white" />,
  "video-creation": <Video className="w-6 h-6 text-white" />,
  "email-writing": <Mail className="w-6 h-6 text-white" />,
  "customer-service": <MessageSquare className="w-6 h-6 text-white" />,
  "coding-assistant": <Code className="w-6 h-6 text-white" />,
};

const scenarios = scenariosData.map((scenario) => ({
  slug: scenario.slug,
  title: scenario.title,
  description: scenario.description,
  toolCount: scenario.toolCount,
  icon: iconMap[scenario.slug],
}));

export default function ScenariosPage() {
  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <Header />

      {/* 页面标题区 */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">场景推荐</h1>
          <p className="text-gray-600 max-w-3xl">
            根据实际使用场景为你推荐最合适的 AI
            工具组合。每个场景都经过编辑团队精心挑选，确保推荐的工具能够真正解决你的问题。
          </p>
        </div>
      </section>

      {/* 场景列表 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>

      {/* 提示说明 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              找不到合适的场景？
            </h3>
            <p className="text-gray-700 mb-4">
              你可以在首页使用 AI
              智能推荐功能，直接描述你的需求，我们会为你推荐最合适的工具。
            </p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              前往首页使用 AI 推荐
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}