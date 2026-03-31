import { memo } from "react";
import { Link } from "react-router";
import { Star, Trophy } from "lucide-react";

interface RankingCardProps {
  rank: number;
  slug: string;
  name: string;
  summary: string;
  tags: string[];
  score: number;
  reason?: string;
}

// ⚡ Bolt: Wrapped RankingCard in React.memo() to prevent unnecessary re-renders.
const RankingCard = memo(function RankingCard({
  rank,
  slug,
  name,
  summary,
  tags,
  score,
  reason,
}: RankingCardProps) {
  const isTopThree = rank <= 3;

  return (
    <div
      className={`card-base rounded-2xl p-6 ${
        isTopThree ? "border-yellow-200" : "hover:shadow-md"
      } transition-all duration-300`}
    >
      <div className="flex items-start space-x-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
            rank === 1
              ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
              : rank === 2
                ? "bg-gray-100 text-gray-700 border border-gray-200"
                : rank === 3
                  ? "bg-orange-100 text-orange-700 border border-orange-200"
                  : "bg-gray-100 text-gray-700"
          }`}
        >
          {rank <= 3 ? <Trophy className="w-6 h-6" /> : rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-[1.05rem] font-semibold text-gray-900 leading-6 mb-1.5">
                {name}
              </h3>
              <p className="text-gray-600 text-sm leading-6">{summary}</p>
            </div>
            <div className="flex items-center space-x-1 score-badge px-3 py-1 rounded-lg">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">{score}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {tags.slice(0, 4).map((tag, index) => (
              <span key={index} className="px-3 py-1 tag-muted text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {reason && (
            <p className="text-sm text-gray-700 leading-6 mb-3 bg-gray-50 p-3 rounded-lg">
              <span className="font-medium text-gray-900">推荐理由：</span>
              {reason}
            </p>
          )}

          <Link
            to={`/tools/${slug}`}
            className="inline-flex items-center space-x-1 link-subtle font-medium text-sm rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 focus-visible:ring-offset-2"
          >
            <span>查看详情</span>
          </Link>
        </div>
      </div>
    </div>
  );
});

export default RankingCard;
