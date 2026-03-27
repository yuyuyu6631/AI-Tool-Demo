import { useState, FormEvent } from "react";
import { Search, Loader2 } from "lucide-react";
import ToolCard from "./ToolCard";
import { Skeleton } from "./ui/skeleton";

interface RecommendedTool {
  name: string;
  slug: string;
  reason: string;
  tags: string[];
  score: number;
}

const exampleQueries = [
  "做 PPT 用什么 AI？",
  "写周报用什么 AI？",
  "AI 编程助手推荐",
];

export default function HeroSearchPanel() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendedTool[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: trimmedQuery }),
      });

      if (!response.ok) {
        throw new Error("推荐请求失败");
      }

      const data = await response.json();
      setResults(data);

      if (data.length === 0) {
        setError("暂时没有找到合适工具，试试换个问法");
      }
    } catch (err) {
      setError("暂时无法获取推荐，请稍后重试");
      console.error("Recommendation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  return (
    <div className="search-panel rounded-[24px] p-5 md:p-6">
      <div className="mb-5">
        <p className="eyebrow text-[11px] font-medium mb-2">AI + Search</p>
        <h3 className="text-[1.35rem] font-semibold text-gray-900 mb-2 leading-8">
          AI+搜索
        </h3>
        <p className="text-sm text-gray-600 leading-6">
          支持直接搜索工具名称，也支持输入自然语言需求获取 AI 推荐结果。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-5">
        <div className="flex flex-col gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入 AI 工具名称，或描述你的需求（如：做 PPT 用什么 AI）"
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
              maxLength={150}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3.5 btn-primary rounded-2xl disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>推荐中...</span>
              </>
            ) : (
              <span>智能推荐</span>
            )}
          </button>
        </div>
      </form>

      {!results.length && !error && (
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-3">常见问题</p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                className="chip-button px-3 py-2 text-sm rounded-full"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-3" aria-live="polite" aria-busy="true">
          <p className="text-sm text-gray-500">正在整理推荐结果...</p>
          {[0, 1].map((item) => (
            <div
              key={item}
              data-testid="recommendation-skeleton"
              className="panel-base rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-28 rounded-md" />
                  <Skeleton className="h-4 w-full max-w-[220px] rounded-md" />
                </div>
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-7 w-16 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-4">推荐结果</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((tool) => (
              <ToolCard
                key={tool.slug}
                slug={tool.slug}
                name={tool.name}
                summary={tool.reason}
                tags={tool.tags}
                score={tool.score}
                reason={tool.reason}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
