import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import HeroSearchPanel from "../HeroSearchPanel";

describe("HeroSearchPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("fills the input when an example query is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HeroSearchPanel />
      </MemoryRouter>,
    );

    const example = screen.getByRole("button", { name: "做 PPT 用什么 AI？" });
    await user.click(example);

    expect(screen.getByRole("textbox")).toHaveValue("做 PPT 用什么 AI？");
  });

  test("shows recommended tools after a successful search", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: "Cursor",
          slug: "cursor",
          reason: "适合高频代码编辑与智能补全。",
          tags: ["编程开发", "AI IDE", "代码补全"],
          score: 9.3,
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <HeroSearchPanel />
      </MemoryRouter>,
    );

    await user.type(screen.getByRole("textbox"), "AI 编程助手推荐");
    await user.click(screen.getByRole("button", { name: "智能推荐" }));

    expect(await screen.findByText("推荐结果")).toBeInTheDocument();
    expect(await screen.findByText("Cursor")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  test("shows skeleton feedback while waiting for recommendations", async () => {
    const user = userEvent.setup();
    let resolveRequest: ((value: any) => void) | undefined;
    const pendingRequest = new Promise((resolve) => {
      resolveRequest = resolve;
    });

    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pendingRequest));

    render(
      <MemoryRouter>
        <HeroSearchPanel />
      </MemoryRouter>,
    );

    await user.type(screen.getByRole("textbox"), "生成一个搜索请求");
    await user.click(screen.getByRole("button", { name: "智能推荐" }));

    expect(screen.getByText("推荐中...")).toBeInTheDocument();
    expect(screen.getAllByTestId("recommendation-skeleton").length).toBeGreaterThan(0);

    resolveRequest?.({
      ok: true,
      json: async () => [],
    });

    await waitFor(() => {
      expect(screen.queryByText("推荐中...")).not.toBeInTheDocument();
    });
  });

  test("shows an error when the search request fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network error")),
    );

    render(
      <MemoryRouter>
        <HeroSearchPanel />
      </MemoryRouter>,
    );

    await user.type(screen.getByRole("textbox"), "测试请求失败");
    await user.click(screen.getByRole("button", { name: "智能推荐" }));

    await waitFor(() => {
      expect(
        screen.getByText("暂时无法获取推荐，请稍后重试"),
      ).toBeInTheDocument();
    });
  });
});
