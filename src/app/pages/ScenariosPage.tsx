import { Link } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScenarioCard from "../components/ScenarioCard";
import Breadcrumbs from "../components/Breadcrumbs";
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
  ppt: <FileText className="w-5 h-5 text-gray-700" />,
  writing: <Target className="w-5 h-5 text-gray-700" />,
  "data-analysis": <BarChart className="w-5 h-5 text-gray-700" />,
  "agent-platform": <Briefcase className="w-5 h-5 text-gray-700" />,
  "video-creation": <Video className="w-5 h-5 text-gray-700" />,
  "email-writing": <Mail className="w-5 h-5 text-gray-700" />,
  "customer-service": <MessageSquare className="w-5 h-5 text-gray-700" />,
  "coding-assistant": <Code className="w-5 h-5 text-gray-700" />,
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
    <div className="page-shell">
      <Header />

      <section className="section-band py-12 md:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "首页", to: "/" },
              { label: "场景推荐" },
            ]}
          />
          <p className="eyebrow text-xs font-medium mb-3">Scenarios</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">场景推荐</h1>
          <p className="text-gray-600 max-w-3xl leading-7">
            如果你更像是在做选型，而不是找某个具体名字，从场景入口会更快，也更不容易迷路。
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="panel-base rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">没有找到合适场景？</h3>
            <p className="text-gray-700 mb-4 leading-7">
              可以回到首页直接描述你的任务，我们会先给你一组更贴近需求的候选，再继续往详情页收敛。
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-5 py-3 btn-primary rounded-full transition"
            >
              回到首页做智能推荐
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
