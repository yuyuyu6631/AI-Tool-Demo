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
    expect(screen.getByText("同一个任务，看看哪个 AI 真能做好")).toBeInTheDocument();
    expect(screen.getByText("先看统一输入、原始输出、缺陷标注和免费/付费建议，再决定要不要试、要不要买。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /看本周实测/ })).toHaveAttribute("href", "/scenarios");
    expect(screen.getByRole("link", { name: /看免费福利/ })).toHaveAttribute("href", "/deals");
    expect(screen.getByRole("link", { name: /逛工具库/ })).toHaveAttribute("href", "/tools?mode=search&page=1&page_size=24");
    expect(screen.getByText("原始输出可复查")).toBeInTheDocument();
    expect(screen.getByText("缺陷和避坑前置")).toBeInTheDocument();
    expect(screen.getByTestId("home-signal-radar")).toBeInTheDocument();
    expect(screen.queryByText("ChatGPT")).not.toBeInTheDocument();
  });

  it("submits task input to the unified tools search page", async () => {
    renderHome();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "free PPT" } });
    fireEvent.submit(screen.getByRole("searchbox").closest("form")!);

    await waitFor(() => expect(pushMock).toHaveBeenCalled());
    expect(pushMock.mock.calls[0][0]).toBe("/tools?mode=ai&q=free%20PPT&page=1&page_size=24");
  });

  it("quick task entries point to scene pages", () => {
    renderHome();

    expect(screen.getByRole("link", { name: "论文改文" })).toHaveAttribute("href", "/scene/paper");
    expect(screen.getByRole("link", { name: "PPT 润思路" })).toHaveAttribute("href", "/scene/ppt");
    expect(screen.getByRole("link", { name: "表格看不懂" })).toHaveAttribute("href", "/scene/data");
    expect(screen.getByRole("link", { name: "想做长图" })).toHaveAttribute("href", "/scene/design");
    expect(screen.getByRole("link", { name: "代码快速修复" })).toHaveAttribute("href", "/scene/code");
    expect(screen.getByRole("link", { name: "视频来不及剪" })).toHaveAttribute("href", "/scene/video");
    expect(screen.getByRole("link", { name: "简历优化" })).toHaveAttribute("href", "/scene/resume");
    expect(screen.getByRole("link", { name: "报告生成" })).toHaveAttribute("href", "/scene/report");
  });

  it("switches the radar copy on quick task hover", () => {
    renderHome();

    fireEvent.mouseEnter(screen.getByRole("link", { name: "论文改文" }));
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
