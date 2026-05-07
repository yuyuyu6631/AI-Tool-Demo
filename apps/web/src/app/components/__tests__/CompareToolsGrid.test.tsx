import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import CompareToolsGrid from "../CompareToolsGrid";
import type { ToolSummary } from "../../lib/catalog-types";

vi.mock("../ToolCard", () => ({
  default: ({
    name,
    onCompareToggle,
    onDetailClick,
    compareDisabled,
  }: {
    name: string;
    onCompareToggle?: () => void;
    onDetailClick?: () => void;
    compareDisabled?: boolean;
  }) => (
    <div>
      <div>{name}</div>
      {onCompareToggle ? (
        <button type="button" onClick={onCompareToggle} disabled={compareDisabled}>
          compare
        </button>
      ) : null}
      {onDetailClick ? (
        <button type="button" onClick={onDetailClick}>
          detail
        </button>
      ) : null}
    </div>
  ),
}));

const makeTool = (id: number, slug: string, name: string): ToolSummary => ({
  id,
  slug,
  name,
  category: "Assistant",
  score: 9.1,
  summary: `${name} summary`,
  tags: ["assistant"],
  officialUrl: `https://example.com/${slug}`,
  logoPath: null,
  logoStatus: null,
  logoSource: null,
  status: "published",
  featured: true,
  createdAt: "2026-03-01",
  price: "",
  reviewCount: 6,
  accessFlags: { needsVpn: false, cnLang: true },
  pricingType: "subscription",
});

describe("CompareToolsGrid", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("builds a compare link from tools selected across multiple sections", () => {
    render(
      <CompareToolsGrid
        sections={[
          { id: "primary", title: "Primary", items: [makeTool(1, "chatgpt", "ChatGPT")] },
          { id: "alternative", title: "Alternative", items: [makeTool(2, "gamma", "Gamma")] },
        ]}
      />,
    );

    const compareButtons = screen.getAllByRole("button", { name: "compare" });
    fireEvent.click(compareButtons[0]);
    fireEvent.click(compareButtons[1]);

    expect(screen.getByRole("link", { name: "\u67e5\u770b\u5bf9\u6bd4" })).toHaveAttribute(
      "href",
      "/compare/chatgpt-vs-gamma",
    );
  });

  it("allows four tools, disables the fifth, and can clear the compare tray", () => {
    render(
      <CompareToolsGrid
        items={[
          makeTool(1, "chatgpt", "ChatGPT"),
          makeTool(2, "gamma", "Gamma"),
          makeTool(3, "claude", "Claude"),
          makeTool(4, "canva", "Canva"),
          makeTool(5, "cursor", "Cursor"),
        ]}
      />,
    );

    const compareButtons = screen.getAllByRole("button", { name: "compare" });
    fireEvent.click(compareButtons[0]);
    fireEvent.click(compareButtons[1]);
    fireEvent.click(compareButtons[2]);
    fireEvent.click(compareButtons[3]);

    expect(compareButtons[4]).toBeDisabled();
    expect(screen.getByText("\u5de5\u5177\u5bf9\u6bd4 (4/4)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "\u67e5\u770b\u5bf9\u6bd4" })).toHaveAttribute(
      "href",
      "/compare/canva-vs-chatgpt-vs-claude-vs-gamma",
    );

    fireEvent.click(screen.getByRole("button", { name: "\u6e05\u7a7a" }));

    expect(screen.getByText("\u5de5\u5177\u5bf9\u6bd4 (0/4)")).toBeInTheDocument();
    expect(screen.getByText("\u9009\u62e9\u81f3\u5c11 2 \u4e2a")).toBeInTheDocument();
  });

  it("remembers the current route before opening a tool detail", () => {
    window.history.pushState({}, "", "/scenarios/marketing?tab=primary");

    render(
      <CompareToolsGrid
        rememberDetailNavigation
        sections={[{ id: "primary", title: "Primary", items: [makeTool(1, "chatgpt", "ChatGPT")] }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "detail" }));

    expect(window.sessionStorage.getItem("catalog:return-route")).toBe("/scenarios/marketing?tab=primary");
  });

  it("shows a homepage-oriented empty state for empty sections", () => {
    render(
      <CompareToolsGrid
        sections={[
          {
            id: "empty",
            title: "Empty",
            items: [],
            emptyTitle: "Nothing here yet",
            emptyDescription: "Use the hot list or submit another tool.",
          },
        ]}
      />,
    );

    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "\u53bb\u770b\u70ed\u95e8\u5de5\u5177" })).toHaveAttribute(
      "href",
      "/?view=hot",
    );
    expect(screen.getByRole("link", { name: "\u63d0\u4ea4\u4f60\u5e38\u7528\u7684\u5de5\u5177" })).toHaveAttribute(
      "href",
      "/#submit-tool",
    );
  });
});
