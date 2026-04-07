import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "../AuthProvider";
import AuthCard, { resolveNextHref } from "../AuthCard";

const mockFetch = vi.fn();

function renderWithProvider(ui: ReactNode) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

function jsonResponse(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("AuthCard", () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to tools when next href contains malformed encoding", () => {
    expect(resolveNextHref("/tools?category=ai-%E9%9F%B3%E9%A2%91%")).toBe("/tools");
  });

  it("switches between login and register tabs", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: "ok" }, 200));

    renderWithProvider(<AuthCard />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "登录星点评" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "注册" }));

    expect(screen.getByRole("heading", { name: "加入星点评" })).toBeInTheDocument();
    expect(screen.getByLabelText("用户名")).toBeInTheDocument();
  });

  it("shows a precise readiness warning when backend is not ready", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ status: "not_ready", reason: "database_unavailable" }, 503),
    );

    renderWithProvider(<AuthCard />);

    expect(
      await screen.findByText("后端已经响应，但数据库或鉴权还没准备好。请先确认 MySQL 可用后再重试。"),
    ).toBeInTheDocument();
  });

  it("submits login after readiness succeeds", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ status: "ok" }, 200))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            id: 1,
            username: "demo-user",
            email: "demo@example.com",
            status: "active",
            createdAt: "2026-03-31T00:00:00Z",
          },
          200,
        ),
      );

    renderWithProvider(<AuthCard nextHref="/tools?category=chatbot" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "登录星点评" })).toBeInTheDocument();
    });

    expect(screen.getByText("登录成功后将返回上一页。")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("邮箱或用户名"), { target: { value: "demo@example.com" } });
    fireEvent.change(screen.getByLabelText("密码"), { target: { value: "12345678" } });
    fireEvent.click(screen.getByText("登录", { selector: "button[type='submit']" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
