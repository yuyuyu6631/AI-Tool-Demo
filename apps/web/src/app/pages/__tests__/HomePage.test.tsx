import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  default: ({ name }: { name: string }) => <div>{name}</div>,
}));

vi.mock("../../components/ToolLogo", () => ({
  default: ({ name }: { name: string }) => <div aria-label={`${name} logo`}>{name.slice(0, 1)}</div>,
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
  features: ["长文本理解稳定"],
  limitations: ["复杂工作流需要二次编排"],
  bestFor: ["内容团队"],
  dealSummary: "有免费额度",
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
  limitations: ["中文模板质量不稳定"],
  dealSummary: "",
};

const directory: ToolsDirectoryResponse = {
  items: [toolA, toolB],
  total: 2,
  page: 1,
  pageSize: 24,
  hasMore: false,
  categories: [{ slug: "chatbot", label: "General Assistant", count: 12 }],
  tags: [{ slug: "chat", label: "Chat", count: 1 }],
  statuses: [],
  priceFacets: [{ slug: "free", label: "Free", count: 1 }],
  accessFacets: [],
  priceRangeFacets: [],
  presets: [],
};

const scenarios: ScenarioSummary[] = [];

function renderHome(state: React.ComponentProps<typeof HomePage>["state"] = { page: "1" }) {
  return render(<HomePage directory={directory} hotTools={[toolA, toolB]} latestTools={[toolB]} scenarios={scenarios} state={state} />);
}

describe("HomePage", () => {
  beforeEach(() => {
    pushMock.mockReset();
    window.sessionStorage.clear();
  });

  it("renders the entry hall with three clear paths", () => {
    renderHome();

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.queryByText("Footer")).not.toBeInTheDocument();
    expect(screen.getByTestId("hero-particle-scene")).toBeInTheDocument();
    expect(screen.getByText("3 秒找到能用的 AI 工具")).toBeInTheDocument();
    expect(screen.getByText("说任务、看福利、逛工具库。别在一堆工具名里硬猜，先选你现在最想走的路。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /按任务找/ })).toHaveAttribute("href", "/search");
    expect(screen.getByRole("link", { name: /看免费福利/ })).toHaveAttribute("href", "/deals");
    expect(screen.getByRole("link", { name: /逛工具库/ })).toHaveAttribute("href", "/tools?mode=search&page=1&page_size=24");
    expect(screen.getByTestId("home-signal-radar")).toBeInTheDocument();
    expect(screen.queryByText("ChatGPT")).not.toBeInTheDocument();
  });

  it("submits task input to the search page", async () => {
    renderHome();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "free PPT" } });
    fireEvent.submit(screen.getByRole("searchbox").closest("form")!);

    await waitFor(() => expect(pushMock).toHaveBeenCalled());
    expect(pushMock.mock.calls[0][0]).toBe("/search?task=free%20PPT");
  });

  it("quick task entries point to scene pages", () => {
    renderHome();

    expect(screen.getByRole("link", { name: "论文快交了" })).toHaveAttribute("href", "/scene/paper");
    expect(screen.getByRole("link", { name: "PPT 没思路" })).toHaveAttribute("href", "/scene/ppt");
    expect(screen.getByRole("link", { name: "表格看不懂" })).toHaveAttribute("href", "/scene/data");
    expect(screen.getByRole("link", { name: "想做张图" })).toHaveAttribute("href", "/scene/design");
    expect(screen.getByRole("link", { name: "代码跑不通" })).toHaveAttribute("href", "/scene/code");
    expect(screen.getByRole("link", { name: "视频来不及剪" })).toHaveAttribute("href", "/scene/video");
  });

  it("switches the radar copy on quick task hover", () => {
    renderHome();

    fireEvent.mouseEnter(screen.getByRole("link", { name: "论文快交了" }));
    expect(screen.getByText("论文这件事，别一上来就让 AI 写全文")).toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByRole("link", { name: "表格看不懂" }));
    expect(screen.getByText("表格问题一般不是单纯丢给 AI 就完事")).toBeInTheDocument();
  });

  it("focuses the task input from the radar action", () => {
    renderHome();

    fireEvent.click(screen.getByRole("button", { name: /聚焦任务输入/ }));
    expect(document.activeElement).toBe(screen.getByRole("searchbox"));
  });
});
