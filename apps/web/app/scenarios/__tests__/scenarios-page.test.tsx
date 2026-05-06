import React from "react";
import { render, screen } from "@testing-library/react";
import ScenariosPage from "../page";
import ScenarioDetailPage from "../[slug]/page";
import type { ToolsDirectoryResponse } from "@/src/app/lib/catalog-types";

vi.mock("@/src/app/components/Header", () => ({
  default: () => <div>Header</div>,
}));

vi.mock("@/src/app/components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("@/src/app/components/Breadcrumbs", () => ({
  default: () => <nav>Breadcrumbs</nav>,
}));

vi.mock("@/src/app/components/CatalogScrollRestorer", () => ({
  default: () => null,
}));

vi.mock("@/src/app/components/CompareToolsGrid", () => ({
  default: ({ sections }: { sections: { title: string; items: { name: string }[] }[] }) => (
    <div>
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.items.map((tool) => (
            <p key={tool.name}>{tool.name}</p>
          ))}
        </section>
      ))}
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not found");
  },
}));

const directory: ToolsDirectoryResponse = {
  items: [
    {
      id: 1,
      slug: "paper-ai",
      name: "Paper AI",
      category: "Writing",
      categorySlug: "writing",
      score: 8.8,
      summary: "Format paper drafts.",
      tags: ["paper"],
      officialUrl: "https://example.com",
      status: "published",
      featured: false,
      createdAt: "2026-04-01",
      price: "",
    },
  ],
  total: 1,
  page: 1,
  pageSize: 6,
  hasMore: false,
  categories: [],
  tags: [],
  statuses: [],
  priceFacets: [],
  accessFacets: [],
  priceRangeFacets: [],
  presets: [],
};

vi.mock("@/src/app/lib/catalog-api", () => ({
  fetchScenarios: vi.fn(async () => []),
  fetchScenarioDetail: vi.fn(async () => null),
  fetchDirectory: vi.fn(async () => directory),
}));

describe("scenario pages", () => {
  it("renders the featured scenario index entries", async () => {
    render(await ScenariosPage());

    expect(screen.getByRole("link", { name: /做 PPT 用什么 AI/ })).toHaveAttribute("href", "/scenarios/make-ppt");
    expect(screen.getByRole("link", { name: /写论文排版/ })).toHaveAttribute("href", "/scenarios/paper-format");
    expect(screen.getByRole("link", { name: /分析 Excel 数据/ })).toHaveAttribute("href", "/scenarios/excel-analysis");
    expect(screen.getByRole("link", { name: /下一页/ })).toHaveAttribute("href", "/tools?page=2&page_size=24");
  });

  it("renders fallback detail content when the backend scenario is missing", async () => {
    render(await ScenarioDetailPage({ params: Promise.resolve({ slug: "paper-format" }) }));

    expect(screen.getByRole("heading", { name: "写论文排版" })).toBeInTheDocument();
    expect(screen.getByText("操作流程")).toBeInTheDocument();
    expect(screen.getByText("Paper AI")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "工具库下一页" })).toHaveAttribute("href", "/tools?page=2&page_size=24");
  });
});
