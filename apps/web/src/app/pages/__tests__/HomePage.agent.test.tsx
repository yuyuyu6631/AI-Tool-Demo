import { render, screen } from "@testing-library/react";
import HomePage from "../HomePage";
import type { AgentRecommendation, ScenarioSummary, ToolSummary, ToolsDirectoryResponse } from "../../lib/catalog-types";

vi.mock("../../components/Header", () => ({
  default: () => <div>Header</div>,
}));

vi.mock("../../components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("../../components/ToolCard", () => ({
  default: ({ name, agentPlan }: { name: string; agentPlan?: { fit_reason: string } }) => (
    <div>
      <div>{name}</div>
      {agentPlan ? <div>{agentPlan.fit_reason}</div> : null}
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("../../lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

const tool: ToolSummary = {
  id: 1,
  slug: "chatgpt",
  name: "ChatGPT",
  category: "通用助手",
  categorySlug: "assistant",
  score: 9,
  summary: "适合梳理任务。",
  tags: ["写作"],
  officialUrl: "https://example.com/chatgpt",
  logoPath: null,
  logoStatus: null,
  logoSource: null,
  status: "published",
  featured: true,
  createdAt: "2026-04-01",
  price: "",
  reviewCount: 3,
  accessFlags: { needsVpn: false, cnLang: true, cnPayment: true },
  pricingType: "freemium",
  features: ["流程梳理"],
  limitations: ["结果需要人工核验"],
  bestFor: ["论文排版"],
  dealSummary: "免费版可试用",
  primaryMedia: null,
};

const directory: ToolsDirectoryResponse = {
  items: [tool],
  total: 1,
  page: 1,
  pageSize: 24,
  hasMore: false,
  categories: [],
  tags: [],
  statuses: [],
  priceFacets: [],
  accessFacets: [],
  priceRangeFacets: [],
  presets: [],
};

const agentRecommendation: AgentRecommendation = {
  intent: {
    summary: "用户希望把 Word 文档整理成论文格式",
    task: "论文与文档处理",
    constraints: ["免费或低成本优先"],
  },
  trace: [
    { id: "intent", title: "识别需求", description: "用户输入论文排版", status: "done" },
    { id: "scene", title: "确认场景", description: "论文与文档处理", status: "done" },
    { id: "recall", title: "检索候选", description: "召回 ChatGPT", status: "done" },
    { id: "verify", title: "核验风险", description: "检查限制", status: "done" },
    { id: "recommend", title: "生成下一步", description: "输出流程", status: "done" },
  ],
  toolPlan: [
    {
      tool_slug: "chatgpt",
      tool_name: "ChatGPT",
      role: "主推荐",
      fit_reason: "适合先梳理论文格式问题",
      free_signal: "免费版可试用",
      limitation_risk: "引用和格式仍需人工核验",
      next_step: "先上传一页样本文档试跑",
    },
  ],
  alternatives: [],
  confidence: "high",
};

const scenarios: ScenarioSummary[] = [];

describe("HomePage agent recommendation", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("keeps the home page as an entry hall even when agent data is present", () => {
    render(
      <HomePage
        directory={directory}
        hotTools={[tool]}
        latestTools={[]}
        scenarios={scenarios}
        state={{ mode: "ai", q: "我要把 Word 文档排版成论文格式", page: "1" }}
        agentRecommendation={agentRecommendation}
      />,
    );

    expect(screen.getByText("3 秒定位 · 第三方 AI 工具测评")).toBeInTheDocument();
    expect(screen.getByTestId("home-signal-radar")).toBeInTheDocument();
    expect(screen.queryByTestId("product-critique-deck")).not.toBeInTheDocument();
    expect(screen.queryByText("ChatGPT")).not.toBeInTheDocument();
    expect(screen.queryByText("适合先梳理论文格式问题")).not.toBeInTheDocument();
  });
});
