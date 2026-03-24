import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

interface ScenarioCardProps {
  slug: string;
  title: string;
  description: string;
  toolCount: number;
  icon?: React.ReactNode;
}

export default function ScenarioCard({
  slug,
  title,
  description,
  toolCount,
  icon,
}: ScenarioCardProps) {
  return (
    <Link to={`/scenarios/${slug}`}>
      <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
            {icon}
          </div>
        )}

        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>

        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-600 font-medium">
            {toolCount} 个推荐工具
          </span>
          <ArrowRight className="w-5 h-5 text-blue-600" />
        </div>
      </div>
    </Link>
  );
}
