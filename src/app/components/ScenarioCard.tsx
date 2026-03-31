import React, { memo } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

interface ScenarioCardProps {
  slug: string;
  title: string;
  description: string;
  toolCount: number;
  icon?: ReactNode;
}

// ⚡ Bolt: Wrapped ScenarioCard in React.memo() to prevent unnecessary re-renders.
const ScenarioCard = memo(function ScenarioCard({
  slug,
  title,
  description,
  toolCount,
  icon,
}: ScenarioCardProps) {
  return (
    <Link
      to={`/scenarios/${slug}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 focus-visible:ring-offset-2"
    >
      <div className="card-base rounded-2xl p-6 transition-all duration-200 h-full">
        {icon && (
          <div className="w-11 h-11 icon-tile rounded-xl flex items-center justify-center mb-4">
            {icon}
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-6 mb-5">{description}</p>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">{toolCount} 个推荐工具</span>
          <ArrowRight className="w-5 h-5 text-gray-400 transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
});

export default ScenarioCard;
