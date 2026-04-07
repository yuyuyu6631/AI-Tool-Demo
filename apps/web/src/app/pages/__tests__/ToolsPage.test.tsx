import React from "react";
import { render, screen } from "@testing-library/react";
import ToolsPage from "../ToolsPage";
import type { ToolsDirectoryResponse } from "../../lib/catalog-types";

vi.mock("../../components/Header", () => ({
  default: () => <div>Header</div>,
}));

vi.mock("../../components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("../../components/Breadcrumbs", () => ({
  default: () => <div>Breadcrumbs</div>,
}));

const directory: ToolsDirectoryResponse = {
  items: [
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
      status: "draft",
      featured: true,
      createdAt: "2026-03-01",
      price: "",
    },
  ],
  total: 28,
  page: 2,
  pageSize: 9,
  hasMore: true,
  categories: [{ slug: "general", label: "通用助手", count: 1 }],
  tags: [
    { slug: "chat", label: "对话", count: 1 },
    { slug: "writing", label: "写作", count: 1 },
    { slug: "image", label: "图像", count: 1 },
    { slug: "video", label: "视频", count: 1 },
    { slug: "audio", label: "音频", count: 1 },
    { slug: "code", label: "代码", count: 1 },
    { slug: "agent", label: "智能体", count: 1 },
    { slug: "office", label: "办公", count: 1 },
    { slug: "report", label: "报表", count: 1 },
    { slug: "analytics", label: "分析", count: 1 },
  ],
  statuses: [{ slug: "draft", label: "草稿", count: 1 }],
  priceFacets: [{ slug: "free", label: "免费", count: 1 }],
  presets: [{ id: "hot", label: "最热", description: "优先查看当前目录中的高频工具。", count: 1 }],
};

describe("ToolsPage", () => {
  it("renders directory filters and numbered pagination", () => {
    render(<ToolsPage directory={directory} state={{ view: "hot", page: "2" }} />);

    expect(screen.getByRole("heading", { name: "工具目录" })).toBeInTheDocument();
    expect(screen.getByText("决策筛选")).toBeInTheDocument();
    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "分页导航" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute("href", "/tools?view=hot&page=1");
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
  });

  it("renders empty state with reset actions", () => {
    render(
      <ToolsPage
        directory={{ ...directory, items: [], total: 0, page: 1, hasMore: false }}
        state={{ q: "missing", view: "hot" }}
      />,
    );

    expect(screen.getByText("暂无匹配工具")).toBeInTheDocument();
    expect(screen.getAllByText("重置筛选").length).toBeGreaterThan(0);
  });

  it("collapses low-frequency tags into the more section", () => {
    render(<ToolsPage directory={directory} state={{ view: "hot", page: "1" }} />);

    expect(screen.getByText("更多标签 (2)")).toBeInTheDocument();
  });
});
