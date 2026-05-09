"use client";

import { useEffect } from "react";
import { rememberRecentTool } from "../lib/recent-tools";

interface RecentToolTrackerProps {
  slug: string;
  name: string;
  summary: string;
  category?: string;
}

export default function RecentToolTracker({ slug, name, summary, category }: RecentToolTrackerProps) {
  useEffect(() => {
    rememberRecentTool({ slug, name, summary, category });
  }, [category, name, slug, summary]);

  return null;
}
