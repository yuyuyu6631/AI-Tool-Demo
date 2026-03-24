import { useParams, Link } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ToolCard from "../components/ToolCard";
import { FileText, Target, BarChart, Briefcase, Video, Mail, MessageSquare, Code } from "lucide-react";
import toolsData from "../../data/tools.json";
import scenariosData from "../../data/scenarios.json";

const iconMap: Record<string, React.ReactNode> = {
  ppt: <FileText className="w-8 h-8 text-white" />,
  writing: <Target className="w-8 h-8 text-white" />,
  "data-analysis": <BarChart className="w-8 h-8 text-white" />,
  "agent-platform": <Briefcase className="w-8 h-8 text-white" />,
  "video-creation": <Video className="w-8 h-8 text-white" />,
  "email-writing": <Mail className="w-8 h-8 text-white" />,
  "customer-service": <MessageSquare className="w-8 h-8 text-white" />,
  "coding-assistant": <Code className="w-8 h-8 text-white" />,
};

export default function ScenarioDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const config = scenariosData.find((s) => s.slug === slug);

  if (!config) {
    return (
      <div className="min-h-screen bg-[#F6F8FB]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">场景不存在</h1>
            <Link to="/scenarios" className="text-blue-600 hover:text-blue-700">
              返回场景列表
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const primaryTools = toolsData.filter((tool) =>
    config.primaryTools.includes(tool.slug)
  );
  const alternativeTools = toolsData.filter((tool) =>
    config.alternativeTools.includes(tool.slug)
  );

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <Header />

      {/* 场景标题区 */}
      <section className="bg-gradient-to-br from-blue-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              {iconMap[config.slug]}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{config.title}</h1>
              <p className="text-xl text-blue-100">{config.description}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 问题说明 */}
        <section className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">场景说明</h2>
          <p className="text-gray-700 leading-relaxed">{config.problem}</p>
        </section>

        {/* 主推荐工具 */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">主推荐工具</h2>
            <p className="text-gray-600">这些工具在该场景下表现最佳，优先推荐使用</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {primaryTools.map((tool) => (
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
        </section>

        {/* 备选方案 */}
        {alternativeTools.length > 0 && (
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">备选方案</h2>
              <p className="text-gray-600">
                如果主推荐工具不适合，可以尝试以下替代方案
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alternativeTools.map((tool) => (
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
          </section>
        )}

        {/* 适合人群说明 */}
        <section className="bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">适合人群</h2>
          <div className="flex flex-wrap gap-3">
            {config.targetAudience.map((audience, index) => (
              <span
                key={index}
                className="px-5 py-3 bg-gradient-to-br from-blue-50 to-teal-50 text-blue-700 rounded-xl font-medium border border-blue-100"
              >
                {audience}
              </span>
            ))}
          </div>
        </section>

        {/* 其他场景入口 */}
        <section className="mt-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            探索其他场景
          </h3>
          <div className="flex flex-wrap gap-3">
            {scenariosData
              .filter((s) => s.slug !== slug)
              .slice(0, 4)
              .map((scenario) => (
                <Link
                  key={scenario.slug}
                  to={`/scenarios/${scenario.slug}`}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:shadow-md transition text-gray-700 hover:text-blue-600"
                >
                  {scenario.title}
                </Link>
              ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}