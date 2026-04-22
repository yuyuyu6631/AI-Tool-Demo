import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import HomePage from "../HomePage";
import type { ScenarioSummary, ToolSummary, ToolsDirectoryResponse } from "../../lib/catalog-types";

const pushMock = vi.fn();

vi.mock("../../components/Header", () => ({
  default: () => <div>Header</div>,
}));

vi.mock("../../components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("../../components/ToolCard", () => ({
  default: ({ name, onDetailClick }: { name: string; onDetailClick?: () => void }) => (
    <div>
      <div>{name}</div>
      {onDetailClick ? (
        <button type="button" onClick={onDetailClick}>
          detail
        </button>
      ) : null}
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("../../lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

const toolA: ToolSummary = {
  id: 1,
  slug: "chatgpt",
  name: "ChatGPT",
  category: "General Assistant",
  categorySlug: "chatbot",
  score: 9.5,
  summary: "Writing, analysis, and coding support.",
  tags: ["chat", "writing"],
  officialUrl: "https://chat.openai.com",
  logoPath: null,
  logoStatus: null,
  logoSource: null,
  status: "published",
  featured: true,
  createdAt: "2026-03-01",
  price: "",
  reviewCount: 6,
  accessFlags: { needsVpn: false, cnLang: true, cnPayment: true },
  pricingType: "free",
};

const toolB: ToolSummary = {
  ...toolA,
  id: 2,
  slug: "gamma",
  name: "Gamma",
  category: "Writing Office",
  categorySlug: "writing",
  summary: "Fast deck generation.",
  featured: false,
  createdAt: "2026-03-10",
};

const directory: ToolsDirectoryResponse = {
  items: [toolA, toolB],
  total: 2,
  page: 1,
  pageSize: 24,
  hasMore: false,
  categories: [
    { slug: "chatbot", label: "General Assistant", count: 12 },
    { slug: "writing", label: "AI Writing", count: 8 },
    { slug: "coding", label: "AI Coding", count: 5 },
    { slug: "image", label: "AI Image", count: 4 },
    { slug: "office", label: "AI Office", count: 6 },
    { slug: "video", label: "AI Video", count: 3 },
  ],
  tags: [{ slug: "chat", label: "Chat", count: 1 }],
  statuses: [],
  priceFacets: [{ slug: "free", label: "Free", count: 1 }],
  accessFacets: [
    { slug: "no-vpn", label: "Direct Access", count: 1 },
    { slug: "cn-lang", label: "Chinese UI", count: 1 },
  ],
  priceRangeFacets: [],
  presets: [],
};

const scenarios: ScenarioSummary[] = [
  {
    id: 1,
    slug: "student",
    title: "Student Learning",
    description: "Homework, notes, and research.",
    problem: "Study efficiency",
    toolCount: 1,
    primaryTools: [],
    alternativeTools: [],
    targetAudience: ["Students", "Beginners"],
  },
];

describe("HomePage", () => {
  beforeEach(() => {
    pushMock.mockReset();
    window.sessionStorage.clear();
  });

  it("renders the directory shell and key entry points", () => {
    render(
      <HomePage directory={directory} hotTools={[toolA, toolB]} latestTools={[toolB]} scenarios={scenarios} state={{ page: "1" }} />,
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveAttribute("data-global-search-target", "tools");
    expect(screen.getByRole("link", { name: "AI Agent" })).toBeInTheDocument();
    expect(screen.getAllByText("ChatGPT").length).toBeGreaterThan(0);
    expect(screen.getByText("Student Learning")).toBeInTheDocument();
  });

  it("submits search to the homepage directory query", () => {
    render(
      <HomePage directory={directory} hotTools={[toolA, toolB]} latestTools={[toolB]} scenarios={scenarios} state={{ page: "1" }} />,
    );

    const searchbox = screen.getByRole("searchbox");
    fireEvent.change(searchbox, { target: { value: "free PPT" } });
    fireEvent.submit(searchbox.closest("form")!);

    expect(pushMock).toHaveBeenCalledWith("/?q=free+PPT&page=1");
  });

  it("remembers the current homepage route before opening detail", () => {
    render(
      <HomePage directory={directory} hotTools={[toolA, toolB]} latestTools={[toolB]} scenarios={scenarios} state={{ page: "2", q: "writing" }} />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "detail" })[0]);

    const rememberedRoute = window.sessionStorage.getItem("catalog:return-route");
    expect(rememberedRoute).toContain("q=writing");
    expect(rememberedRoute).toContain("page=2");
  });

  it("shows active filters and reset entry when filtered", () => {
    render(
      <HomePage
        directory={directory}
        hotTools={[toolA, toolB]}
        latestTools={[toolB]}
        scenarios={scenarios}
        state={{ tab: "latest", view: "latest", page: "1", q: "coding", category: "chatbot", access: "no-vpn,cn-lang" }}
      />,
    );

    expect(screen.getByText((content) => content.includes("coding"))).toBeInTheDocument();
    expect(screen.getAllByText((content) => content.includes("General Assistant")).length).toBeGreaterThan(0);
    expect(screen.getByText((content) => content.includes("Direct Access / Chinese UI"))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /\u91cd\u7f6e/ })).toBeInTheDocument();
  });

  it("shows immediate pending feedback when a category is clicked", () => {
    render(
      <HomePage directory={directory} hotTools={[toolA, toolB]} latestTools={[toolB]} scenarios={scenarios} state={{ page: "1" }} />,
    );

    fireEvent.click(screen.getByRole("link", { name: "AI Agent" }));

    expect(screen.getAllByText((content) => content.includes("正在切换到 AI Agent")).length).toBeGreaterThan(0);
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
  });

  it("falls back to recommended tools instead of showing an empty directory", () => {
    render(
      <HomePage
        directory={{ ...directory, items: [], total: 0 }}
        hotTools={[toolA, toolB]}
        latestTools={[toolB]}
        scenarios={scenarios}
        state={{ tab: "free", price: "free", page: "1" }}
      />,
    );

    expect(screen.getAllByText("ChatGPT").length).toBeGreaterThan(0);
  });
});
