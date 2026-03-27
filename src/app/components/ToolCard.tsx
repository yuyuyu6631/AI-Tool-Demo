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

export default function ToolCard({
  slug,
  name,
  summary,
  tags,
  score,
  reason,
}: ToolCardProps) {
  return (
    <div className="card-base rounded-2xl p-6 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-[17px] font-semibold text-gray-900 leading-6">{name}</h3>
        <div className="flex items-center space-x-1 score-badge px-2.5 py-1 rounded-full">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-semibold">{score}</span>
        </div>
      </div>

      <p className="text-gray-600 text-sm leading-[1.7] mb-5 line-clamp-3">
        {reason || summary}
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="px-3 py-1 tag-muted text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <Link
        to={`/tools/${slug}`}
        className="inline-flex items-center space-x-1 link-subtle font-medium text-sm rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 focus-visible:ring-offset-2"
      >
        <span>查看详情</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
