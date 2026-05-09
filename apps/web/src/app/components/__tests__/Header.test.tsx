import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "../Header";

vi.mock("../HeaderAuthControls", () => ({
  default: () => <div>AuthControls</div>,
}));

vi.mock("../HeaderMobileMenu", () => ({
  default: () => <div>MobileMenu</div>,
}));

vi.mock("../PlatformLogo", () => ({
  default: () => <div>PlatformLogo</div>,
}));

describe("Header", () => {
  it("renders the main route navigation without an inline search trigger", () => {
    render(<Header currentPath="/" currentRoute="/" />);

    expect(screen.getByText("提交工具")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "首页" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "按任务找" })).toHaveAttribute("href", "/search");
    expect(screen.getByRole("link", { name: "场景榜单" })).toHaveAttribute("href", "/scenarios");
    expect(screen.getByRole("link", { name: "免费福利" })).toHaveAttribute("href", "/deals");
    expect(screen.getByRole("link", { name: "工具库" })).toHaveAttribute("href", "/tools?mode=search&page=1&page_size=24");
    expect(screen.queryByText("搜索工具")).not.toBeInTheDocument();
    expect(screen.queryByText("Ctrl+G")).not.toBeInTheDocument();
  });
});
