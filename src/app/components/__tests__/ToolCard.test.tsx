import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import ToolCard from "../ToolCard";

describe("ToolCard", () => {
  test("renders tool information and limits visible tags to three", () => {
    render(
      <MemoryRouter>
        <ToolCard
          slug="demo-tool"
          name="Demo Tool"
          summary="A concise summary"
          tags={["tag-a", "tag-b", "tag-c", "tag-d"]}
          score={9.2}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Demo Tool")).toBeInTheDocument();
    expect(screen.getByText("A concise summary")).toBeInTheDocument();
    expect(screen.getByText("9.2")).toBeInTheDocument();
    expect(screen.getByText("tag-a")).toBeInTheDocument();
    expect(screen.getByText("tag-b")).toBeInTheDocument();
    expect(screen.getByText("tag-c")).toBeInTheDocument();
    expect(screen.queryByText("tag-d")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /查看详情/i })).toHaveAttribute(
      "href",
      "/tools/demo-tool",
    );
  });
});
