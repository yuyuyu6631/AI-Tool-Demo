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
    expect(screen.getByText("别试了再后悔——我们替你测好了")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /聚焦任务输入/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /看本周实测/ })).toHaveAttribute("href", "/scenarios");
    expect(screen.getByRole("link", { name: /看免费福利/ })).toHaveAttribute("href", "/deals");
    expect(screen.getByRole("link", { name: /逛工具库/ })).toHaveAttribute("href", "/tools?mode=search&page=1&page_size=24");
    expect(screen.getByText("说你要做什么")).toBeInTheDocument();
    expect(screen.getByText("看真实对比结果")).toBeInTheDocument();
    expect(screen.queryByText("任务路线预览")).not.toBeInTheDocument();
    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
    expect(screen.queryByText("ChatGPT")).not.toBeInTheDocument();
  });

  it("submits task input to the unified tools search page", async () => {
    renderHome();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "free PPT" } });
    fireEvent.submit(screen.getByRole("searchbox").closest("form")!);

    await waitFor(() => expect(pushMock).toHaveBeenCalled());
    expect(pushMock.mock.calls[0][0]).toBe("/tools?mode=ai&q=free%20PPT&page=1&page_size=24");
  });

  it("quick task entries point to task search pages", () => {
    renderHome();

    expect(screen.getByRole("link", { name: "论文润色" })).toHaveAttribute("href", expect.stringContaining("/tools?mode=ai"));
    expect(screen.getByRole("link", { name: "PPT 出框架" })).toHaveAttribute("href", expect.stringContaining("/tools?mode=ai"));
    expect(screen.getByRole("link", { name: "表格读不懂" })).toHaveAttribute("href", expect.stringContaining("/tools?mode=ai"));
    expect(screen.getByRole("link", { name: "代码跑不通" })).toHaveAttribute("href", expect.stringContaining("/tools?mode=ai"));
    expect(screen.getByRole("link", { name: "长文提炼" })).toHaveAttribute("href", expect.stringContaining("/tools?mode=ai"));
  });

  it("primes the search input on quick task press", () => {
    renderHome();

    fireEvent.pointerDown(screen.getByRole("link", { name: "论文润色" }));
    expect(screen.getByRole("searchbox")).toHaveValue("帮我润色论文");
  });

  it("keeps the primary button as the search submit action", () => {
    renderHome();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "代码报错" } });
    fireEvent.click(screen.getByRole("button", { name: /聚焦任务输入/ }));
    expect(pushMock).toHaveBeenCalledWith("/tools?mode=ai&q=%E4%BB%A3%E7%A0%81%E6%8A%A5%E9%94%99&page=1&page_size=24");
  });
});
