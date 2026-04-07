import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "../HomePage";
import type { PresetView, ScenarioSummary, ToolSummary } from "../../lib/catalog-types";

vi.mock("../../components/Header", () => ({
  default: () => <div>Header</div>,
}));

vi.mock("../../components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

const featuredTools: ToolSummary[] = [
  {
    id: 1,
    slug: "chatgpt",
    name: "ChatGPT",
    category: "通用助手",
    score: 9.5,
    summary: "综合能力稳定，适合写作、分析和代码协作。",
    tags: ["对话", "写作"],
    officialUrl: "https://chat.openai.com",
    logoPath: null,
    logoStatus: null,
    logoSource: null,
    status: "published",
    featured: true,
    createdAt: "2026-03-01",
    price: "",
  },
];

const presets: PresetView[] = [
  { id: "hot", label: "最热", description: "优先查看当前目录中的高频工具。", count: 10 },
  { id: "latest", label: "最新", description: "按最新收录顺序浏览新增工具。", count: 5 },
];

const audienceScenarios: ScenarioSummary[] = [
  {
    id: 1,
    slug: "student",
    title: "学生党专属",
    description: "适合写作业、做汇报、查资料的工具入口。",
    problem: "提升学习效率。",
    toolCount: 1,
    primaryTools: [],
    alternativeTools: [],
    targetAudience: ["学生党", "新手也能用"],
  },
];

describe("HomePage", () => {
  it("renders search-first homepage structure", () => {
    render(
      <HomePage
        featuredTools={featuredTools}
        categories={[{ slug: "general", label: "通用助手", count: 12 }]}
        presets={presets}
        audienceScenarios={audienceScenarios}
      />,
    );

    expect(screen.getByRole("heading", { name: "不是找链接，而是选对 AI 工具" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始筛选" })).toBeInTheDocument();
    expect(screen.getByText("常用分类")).toBeInTheDocument();
    expect(screen.getByText("按人群和场景选")).toBeInTheDocument();
    expect(screen.getByText("最热")).toBeInTheDocument();
  });
});
