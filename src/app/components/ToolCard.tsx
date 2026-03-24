import { Link } from "react-router";
import { Star, ArrowRight } from "lucide-react";

interface ToolCardProps {
  slug: string;
  name: string;
  summary: string;
  tags: string[];
  score: number;
  reason?: string;
}

export default function ToolCard({ slug, name, summary, tags, score, reason }: ToolCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-lg">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold text-gray-900">{score}</span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{reason || summary}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        to={`/tools/${slug}`}
        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm group"
      >
        <span>查看详情</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
