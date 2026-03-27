import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Breadcrumbs from "../Breadcrumbs";

describe("Breadcrumbs", () => {
  test("renders linked ancestors and current page", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs
          items={[
            { label: "首页", to: "/" },
            { label: "榜单", to: "/rankings" },
            { label: "ChatGPT" },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("navigation", { name: "面包屑" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "首页" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "榜单" })).toHaveAttribute("href", "/rankings");
    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
  });
});
