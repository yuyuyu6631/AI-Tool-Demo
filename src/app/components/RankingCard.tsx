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

export default function RankingCard({
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
      className={`bg-white rounded-2xl p-6 border ${
        isTopThree
          ? "border-yellow-300 shadow-lg"
          : "border-gray-200 hover:shadow-md"
      } transition-all duration-300`}
    >
      <div className="flex items-start space-x-4">
        {/* 排名 */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
            rank === 1
              ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
              : rank === 2
              ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
              : rank === 3
              ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {rank <= 3 ? <Trophy className="w-6 h-6" /> : rank}
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{name}</h3>
              <p className="text-gray-600 text-sm">{summary}</p>
            </div>
            <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-lg ml-4">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">{score}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {reason && (
            <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-3 rounded-lg">
              <span className="font-medium text-blue-600">推荐理由：</span>
              {reason}
            </p>
          )}

          <Link
            to={`/tools/${slug}`}
            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            查看详情 →
          </Link>
        </div>
      </div>
    </div>
  );
}
