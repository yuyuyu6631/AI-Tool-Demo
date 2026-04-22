import { render, screen } from "@testing-library/react";
import AdminAccessGate from "../AdminAccessGate";

const mockUseAuth = vi.fn();

vi.mock("../../auth/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("AdminAccessGate", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("shows a loading state while auth is resolving", () => {
    mockUseAuth.mockReturnValue({ currentUser: null, status: "loading" });
    render(<AdminAccessGate>content</AdminAccessGate>);

    expect(screen.getByText("正在验证后台权限...")).toBeInTheDocument();
  });

  it("shows a login redirect hint for guests", () => {
    mockUseAuth.mockReturnValue({ currentUser: null, status: "guest" });
    const { container } = render(<AdminAccessGate redirectPath="/admin/reviews">content</AdminAccessGate>);

    expect(container.textContent).toContain("正在跳转到登录页。若页面未自动跳转，可前往");
    expect(screen.getByRole("link", { name: "登录后台" })).toHaveAttribute("href", "/auth?next=%2Fadmin%2Freviews");
  });

  it("blocks non-admin users", () => {
    mockUseAuth.mockReturnValue({
      currentUser: { role: "user" },
      status: "authenticated",
    });
    render(<AdminAccessGate>content</AdminAccessGate>);

    expect(screen.getByText("当前账号没有后台权限，请使用管理员账号登录。")).toBeInTheDocument();
  });

  it("renders children for admin users", () => {
    mockUseAuth.mockReturnValue({
      currentUser: { role: "admin" },
      status: "authenticated",
    });
    render(<AdminAccessGate>admin content</AdminAccessGate>);

    expect(screen.getByText("admin content")).toBeInTheDocument();
  });
});
