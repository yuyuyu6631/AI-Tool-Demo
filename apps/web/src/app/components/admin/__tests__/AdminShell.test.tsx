import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import AdminShell from "../AdminShell";

vi.mock("../../Header", () => ({
  default: () => <div>Header</div>,
}));

vi.mock("../../Footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("../../Breadcrumbs", () => ({
  default: () => <div>Breadcrumbs</div>,
}));

vi.mock("../AdminAccessGate", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe("AdminShell", () => {
  it("shows the match plan navigation item", () => {
    render(
      <AdminShell currentPath="/admin/match-plans" title="匹配策略" description="配置实时推荐策略">
        <div>content</div>
      </AdminShell>,
    );

    expect(screen.getByRole("link", { name: "匹配策略" })).toHaveAttribute("href", "/admin/match-plans");
  });
});
