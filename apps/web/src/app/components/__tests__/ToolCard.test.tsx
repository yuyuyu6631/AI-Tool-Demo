import React from "react";
import { render, screen } from "@testing-library/react";
import ToolCard from "../ToolCard";

describe("ToolCard", () => {
  it("renders a lightweight catalog card from real tool fields", () => {
    render(
      <ToolCard
        slug="chatgpt"
        name="ChatGPT"
        summary="综合能力稳定，适合写作、分析和代码协作。"
        tags={["对话", "写作", "搜索", "长文本"]}
        url="https://chat.openai.com"
        score={9.5}
        reviewCount={6}
        accessFlags={{ needsVpn: false, cnLang: true }}
        priceLabel="freemium"
        dealSummary="有免费额度"
        features={["长文本理解稳定", "插件生态成熟"]}
        bestFor={["内容团队", "开发者"]}
      />,
    );

    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
    expect(screen.getByText("9.5")).toBeInTheDocument();
    expect(screen.getByText("适合内容团队，用于长文本理解稳定")).toBeInTheDocument();
    expect(screen.getByTestId("price-tag")).toHaveTextContent("有免费额度");
    expect(screen.getByText("对话")).toBeInTheDocument();
    expect(screen.getByText("写作")).toBeInTheDocument();
    expect(screen.getByText("搜索")).toBeInTheDocument();
    expect(screen.queryByText("长文本")).not.toBeInTheDocument();
    expect(screen.queryByText("推荐理由")).not.toBeInTheDocument();
    expect(screen.queryByText("适合")).not.toBeInTheDocument();
    expect(screen.queryByText("价格线索")).not.toBeInTheDocument();
    expect(screen.queryByText("长文本理解稳定 / 插件生态成熟")).not.toBeInTheDocument();
  });

  it("exposes detail links without making the whole card clickable", () => {
    render(<ToolCard slug="chatgpt" name="ChatGPT" summary="稳定的通用助手。" tags={["对话"]} url="https://chat.openai.com" score={9.5} />);

    expect(screen.getByRole("link", { name: "ChatGPT" })).toHaveAttribute("href", "/tools/chatgpt");
    expect(screen.getByRole("link", { name: /详情/ })).toHaveAttribute("href", "/tools/chatgpt");
  });

  it("keeps the official site link pointed at the external url", () => {
    render(<ToolCard slug="chatgpt" name="ChatGPT" summary="稳定的通用助手。" tags={["对话"]} url="https://chat.openai.com" score={9.5} />);

    expect(screen.getByRole("link", { name: "官网" })).toHaveAttribute("href", "https://chat.openai.com");
    expect(screen.getByText("官网")).toBeInTheDocument();
  });

  it("does not crash when logo and score are missing", () => {
    render(<ToolCard slug="mystery-tool" name="Mystery Tool" summary="Unknown access conditions." tags={["new"]} url="https://example.com" />);

    expect(screen.getByText("Mystery Tool")).toBeInTheDocument();
    expect(screen.getByText("待评")).toBeInTheDocument();
    expect(screen.getByTestId("price-tag")).toHaveTextContent("价格待核验");
  });

  it("uses price label when no explicit deal copy exists", () => {
    render(<ToolCard slug="freemium-tool" name="Freemium Tool" summary="A freemium design assistant." tags={["设计", "AI 图像"]} url="https://example.com" score={8.8} priceLabel="freemium" />);

    expect(screen.getByTestId("price-tag")).toHaveTextContent("免费增值");
    expect(screen.getByText("设计")).toBeInTheDocument();
    expect(screen.getByText("AI 图像")).toBeInTheDocument();
  });
});
