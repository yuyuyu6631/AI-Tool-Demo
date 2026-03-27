import React from "react";
import { render, screen } from "@testing-library/react";
import BrandMark from "../BrandMark";

describe("BrandMark", () => {
  test("renders chinese initials for chinese labels", () => {
    render(<BrandMark label="aitoolbox" />);

    expect(screen.getByLabelText("aitoolbox 标识")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
  });

  test("renders uppercase initials for english labels", () => {
    render(<BrandMark label="Open Router" />);

    expect(screen.getByText("OR")).toBeInTheDocument();
  });
});
