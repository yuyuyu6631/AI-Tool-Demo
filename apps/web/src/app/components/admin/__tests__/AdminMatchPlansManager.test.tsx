import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminMatchPlansManager from "../AdminMatchPlansManager";
import {
  fetchAdminMatchPlan,
  fetchAdminMatchPlans,
  fetchAdminTools,
  previewAdminMatchPlan,
  saveAdminMatchPlan,
} from "../../../lib/catalog-api";

vi.mock("../../../lib/catalog-api", () => ({
  fetchAdminMatchPlans: vi.fn(),
  fetchAdminMatchPlan: vi.fn(),
  fetchAdminTools: vi.fn(),
  saveAdminMatchPlan: vi.fn(),
  publishAdminMatchPlan: vi.fn(),
  previewAdminMatchPlan: vi.fn(),
}));

const matchPlan = {
  slug: "paper-plan",
  title: "论文策略",
  description: "论文推荐",
  persona: "student",
  scenario: "academic-writing",
  triggerKeywords: ["论文"],
  status: "draft",
  sortOrder: 0,
  tools: [{ toolSlug: "paperflow", reason: "优先论文排版", sortOrder: 0, weight: 200 }],
};

describe("AdminMatchPlansManager", () => {
  beforeEach(() => {
    vi.mocked(fetchAdminMatchPlans).mockResolvedValue([
      {
        id: 1,
        slug: "paper-plan",
        title: "论文策略",
        status: "draft",
        persona: "student",
        scenario: "academic-writing",
        triggerKeywords: ["论文"],
        toolCount: 1,
        sortOrder: 0,
        updatedAt: "2026-05-06T00:00:00Z",
        publishedAt: null,
      },
    ]);
    vi.mocked(fetchAdminTools).mockResolvedValue([
      {
        id: 1,
        name: "PaperFlow",
        slug: "paperflow",
        categoryName: "Writing",
        status: "published",
        score: 8,
        reviewCount: 0,
      },
    ]);
    vi.mocked(fetchAdminMatchPlan).mockResolvedValue(matchPlan);
    vi.mocked(saveAdminMatchPlan).mockResolvedValue(matchPlan);
    vi.mocked(previewAdminMatchPlan).mockResolvedValue({
      planId: 1,
      matched: true,
      matchedKeywords: ["论文"],
      tools: [
        {
          toolSlug: "paperflow",
          toolName: "PaperFlow",
          reason: "优先论文排版",
          sortOrder: 0,
          weight: 200,
          status: "published",
          available: true,
          issue: null,
        },
      ],
      warnings: [],
    });
  });

  it("loads list, edits a plan, saves, and previews", async () => {
    render(<AdminMatchPlansManager />);

    expect(await screen.findByText("论文策略")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /论文策略/ }));

    expect(await screen.findByDisplayValue("paper-plan")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("输入前台搜索词，例如：我要写论文"), {
      target: { value: "我要写论文" },
    });
    fireEvent.click(screen.getByRole("button", { name: "预览命中" }));

    await waitFor(() => expect(previewAdminMatchPlan).toHaveBeenCalledWith(1, expect.objectContaining({ query: "我要写论文" })));
    expect(await screen.findByTestId("match-plan-preview")).toHaveTextContent("PaperFlow");

    fireEvent.click(screen.getByRole("button", { name: "保存草稿" }));
    await waitFor(() => expect(saveAdminMatchPlan).toHaveBeenCalledWith(expect.objectContaining({ slug: "paper-plan" }), 1));
  });

  it("shows an empty state", async () => {
    vi.mocked(fetchAdminMatchPlans).mockResolvedValueOnce([]);
    render(<AdminMatchPlansManager />);

    expect(await screen.findByText("暂无匹配策略。新建一个策略后，可用关键词驱动前台推荐。")).toBeInTheDocument();
  });
});
