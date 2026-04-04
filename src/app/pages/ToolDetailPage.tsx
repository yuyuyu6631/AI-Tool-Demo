import { useParams, Link } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ToolCard from "../components/ToolCard";
import BrandMark from "../components/BrandMark";
import Breadcrumbs from "../components/Breadcrumbs";
import { Star, ExternalLink, CheckCircle, XCircle, Target, Users } from "lucide-react";
import toolsData from "../../data/tools.json";

// ⚡ Bolt: Pre-compute map outside render for O(1) lookups
const toolsMap = new Map(toolsData.map((t) => [t.slug, t]));

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? toolsMap.get(slug) : undefined;

  if (!tool) {
    return (
      <div className="page-shell">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">工具不存在</h1>
            <Link to="/" className="link-subtle">
              返回首页
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ⚡ Bolt: Use map lookup instead of O(N*M) nested array iterations
  const alternatives = tool.alternatives
    .map((toolSlug) => toolsMap.get(toolSlug))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);

  return (
    <div className="page-shell">
      <Header />

      {/* 工具基础信息区 */}
      <section className="section-band py-12 md:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "首页", to: "/" },
              { label: "榜单", to: "/rankings" },
              { label: tool.name },
            ]}
          />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start space-x-6">
              <BrandMark label={tool.name} size="lg" />

              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl md:text-[2.15rem] font-semibold tracking-tight text-gray-900">{tool.name}</h1>
                  <span className="px-3 py-1 tag-muted text-sm rounded-full">
                    {tool.category}
                  </span>
                </div>
                <p className="text-lg text-gray-600 leading-8 mb-4 max-w-2xl">{tool.summary}</p>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xl font-semibold text-gray-900">{tool.score}</span>
                  <span className="text-gray-500">综合评分</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Link
                to="/rankings"
                className="inline-flex items-center justify-center px-5 py-3 btn-secondary rounded-full transition"
              >
                返回榜单
              </Link>
              <a
                href={tool.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 btn-primary rounded-full transition flex items-center space-x-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>访问官网</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主内容区 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 工具简介 */}
            <section className="panel-base rounded-2xl p-8">
              <h2 className="text-[1.35rem] font-semibold text-gray-900 mb-4">工具简介</h2>
              <p className="text-gray-700 leading-8">{tool.description}</p>
            </section>

            {/* 核心能力 */}
            {tool.abilities && (
              <section className="panel-base rounded-2xl p-8">
                <h2 className="text-[1.35rem] font-semibold text-gray-900 mb-6">核心能力</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {tool.abilities.map((ability, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 tag-muted rounded-xl text-center font-medium"
                    >
                      {ability}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 适合人群 */}
            {tool.targetAudience && (
              <section className="panel-base rounded-2xl p-8">
                <div className="flex items-center space-x-2 mb-6">
                  <Users className="w-6 h-6 text-gray-700" />
                  <h2 className="text-[1.35rem] font-semibold text-gray-900">适合人群</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {tool.targetAudience.map((audience, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 tag-muted rounded-full font-medium"
                    >
                      {audience}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* 优点与不足 */}
            <section className="panel-base rounded-2xl p-8">
              <h2 className="text-[1.35rem] font-semibold text-gray-900 mb-6">优点与不足</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 优点 */}
                <div>
                  <h3 className="flex items-center space-x-2 text-lg font-semibold text-green-700 mb-4">
                    <CheckCircle className="w-5 h-5" />
                    <span>优点</span>
                  </h3>
                  <ul className="space-y-2">
                    {tool.pros.map((pro, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-700">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 不足 */}
                <div>
                  <h3 className="flex items-center space-x-2 text-lg font-semibold text-red-700 mb-4">
                    <XCircle className="w-5 h-5" />
                    <span>不足</span>
                  </h3>
                  <ul className="space-y-2">
                    {tool.cons.map((con, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-red-600 mt-1">✗</span>
                        <span className="text-gray-700">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 推荐场景 */}
            <section className="panel-base rounded-2xl p-8">
              <div className="flex items-center space-x-2 mb-6">
                <Target className="w-6 h-6 text-gray-700" />
                <h2 className="text-[1.35rem] font-semibold text-gray-900">推荐场景</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tool.scenarios.map((scenario, index) => (
                  <div
                    key={index}
                    className="p-4 card-subtle rounded-xl"
                  >
                    <p className="text-gray-800 font-medium">{scenario}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 编辑点评 */}
            <section className="card-subtle rounded-2xl p-8">
              <h2 className="text-[1.35rem] font-semibold text-gray-900 mb-4">编辑点评</h2>
              <p className="text-gray-700 leading-8 italic">
                "{tool.editorComment}"
              </p>
              <p className="text-sm text-gray-500 mt-4">—— aitoolbox 编辑部</p>
            </section>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 标签 */}
            <div className="aside-panel rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">标签</h3>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 tag-muted text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 平替推荐 */}
            {alternatives.length > 0 && (
              <div className="aside-panel rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">平替推荐</h3>
                <div className="space-y-4">
                  {alternatives.map((alt) => (
                    <Link
                      key={alt.slug}
                      to={`/tools/${alt.slug}`}
                      className="block p-4 aside-item rounded-xl"
                    >
                      <h4 className="font-medium text-gray-900 mb-1">{alt.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {alt.summary}
                      </p>
                      <div className="flex items-center space-x-1 mt-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{alt.score}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
