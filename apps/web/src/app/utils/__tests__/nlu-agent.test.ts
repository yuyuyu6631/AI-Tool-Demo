import { parseSearchIntent } from "../nlu-agent";

describe("parseSearchIntent", () => {
  const categories = [
    {
      slug: "chatbot",
      canonicalSlug: "chatbot",
      name: "AI聊天助手",
      description: "",
      toolCount: 10,
      legacySlugs: ["ai-chat"],
    },
    {
      slug: "office",
      canonicalSlug: "office",
      name: "AI办公工具",
      description: "",
      toolCount: 6,
      legacySlugs: ["writing-office"],
    },
  ];

  it("extracts dynamic category aliases and price", () => {
    expect(parseSearchIntent("帮我找 ai-chat 免费工具", categories)).toEqual({
      q: "",
      category: "chatbot",
      price: "free",
      tag: "",
    });
  });

  it("falls back to static business keywords when no dynamic category matches", () => {
    expect(parseSearchIntent("有没有买断的代码工具", categories)).toEqual({
      q: "",
      category: "coding",
      price: "one-time",
      tag: "",
    });
  });

  it("keeps query text when multiple dynamic categories collide", () => {
    expect(parseSearchIntent("AI聊天助手 AI办公工具", categories)).toEqual({
      q: "ai聊天助手ai办公",
      category: "",
      price: "",
      tag: "",
    });
  });
});
