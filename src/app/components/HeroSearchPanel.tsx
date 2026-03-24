import { useState, FormEvent } from "react";
import { Search, Loader2 } from "lucide-react";
import ToolCard from "./ToolCard";

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
        setError("暂未找到合适工具，试试换个问法");
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
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">AI 智能推荐</h3>
      <p className="text-gray-600 mb-6">告诉我你的需求，为你推荐最合适的工具</p>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入 AI 工具名称，或描述你的需求（如：做 PPT 用什么 AI？）"
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={150}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 whitespace-nowrap"
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

      {/* 示例问题 */}
      {!results.length && !error && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">试试这些问题：</p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 推荐结果 */}
      {results.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            为你推荐以下工具：
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((tool, index) => (
              <ToolCard
                key={index}
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
