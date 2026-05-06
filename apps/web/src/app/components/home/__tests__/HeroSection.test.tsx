import React, { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import HeroSection from "../HeroSection";

vi.mock("../HeroParticleScene", () => ({
  default: () => <div data-testid="hero-particle-scene" />,
}));

function renderHero(overrides: Partial<React.ComponentProps<typeof HeroSection>> = {}) {
  const inputRef = createRef<HTMLInputElement>();
  const props: React.ComponentProps<typeof HeroSection> = {
    title: "测试首页标题",
    subtitle: "测试首页副标题",
    query: "",
    inputRef,
    activeQuickTaskId: null,
    onQueryChange: vi.fn(),
    onSearchSubmit: vi.fn(),
    onQuickTaskActivate: vi.fn(),
    onQuickTaskClick: vi.fn(),
    onRadarStart: vi.fn(),
    ...overrides,
  };

  return {
    inputRef,
    props,
    ...render(<HeroSection {...props} />),
  };
}

describe("HeroSection", () => {
  it("renders title, subtitle, and main search entry", () => {
    renderHero();

    expect(screen.getByRole("heading", { name: "测试首页标题" })).toBeInTheDocument();
    expect(screen.getByText("测试首页副标题")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByTestId("hero-particle-scene")).toBeInTheDocument();
  });

  it("submits the search query through the provided callback", () => {
    const onSearchSubmit = vi.fn();
    renderHero({ query: "答辩 PPT", onSearchSubmit });

    fireEvent.submit(screen.getByRole("searchbox").closest("form")!);

    expect(onSearchSubmit).toHaveBeenCalledWith("答辩 PPT");
  });

  it("does not crash without subtitle", () => {
    renderHero({ subtitle: undefined });

    expect(screen.getByRole("heading", { name: "测试首页标题" })).toBeInTheDocument();
  });
});
