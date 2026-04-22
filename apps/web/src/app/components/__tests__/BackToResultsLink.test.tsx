import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BackToResultsLink from "../BackToResultsLink";

vi.mock("next/link", () => ({
  default: ({
    href,
    onClick,
    children,
  }: {
    href: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    children: React.ReactNode;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));

describe("BackToResultsLink", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("falls back to home when no remembered route exists", async () => {
    render(<BackToResultsLink fallbackHref="/" />);

    const link = await screen.findByRole("link", { name: "\u8fd4\u56de\u9996\u9875" });
    expect(link).toHaveAttribute("href", "/");
  });

  it("returns to the remembered scenario route and marks scroll restore", async () => {
    window.sessionStorage.setItem("catalog:return-route", "/scenarios/marketing");
    window.sessionStorage.setItem("catalog:return-scroll", "240");

    render(<BackToResultsLink fallbackHref="/" />);

    const link = await screen.findByRole("link", { name: "\u8fd4\u56de\u573a\u666f" });
    await waitFor(() => {
      expect(link).toHaveAttribute("href", "/scenarios/marketing");
    });

    fireEvent.click(link);

    expect(window.sessionStorage.getItem("catalog:restore-scroll")).toBe("240");
  });

  it("describes filtered home results more clearly", async () => {
    window.sessionStorage.setItem("catalog:return-route", "/?q=writing&page=2");

    render(<BackToResultsLink fallbackHref="/" />);

    expect(await screen.findByRole("link", { name: "\u8fd4\u56de\u641c\u7d22\u7ed3\u679c" })).toHaveAttribute(
      "href",
      "/?q=writing&page=2",
    );
  });
});
