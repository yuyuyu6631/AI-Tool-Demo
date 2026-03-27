import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Header from "../Header";

describe("Header", () => {
  test("renders primary navigation items", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("首页").length).toBeGreaterThan(0);
    expect(screen.getAllByText("榜单").length).toBeGreaterThan(0);
    expect(screen.getAllByText("场景推荐").length).toBeGreaterThan(0);
    expect(screen.getAllByText("查看热门榜单").length).toBeGreaterThan(0);
  });

  test("opens mobile menu when menu button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    expect(screen.getAllByText("关于我们").length).toBeGreaterThan(0);
  });
});
