import { RECENT_TOOLS_KEY, readRecentTools, rememberRecentTool } from "../recent-tools";

describe("recent-tools", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores recent tool visits without requiring login", () => {
    rememberRecentTool({
      slug: "chatgpt",
      name: "ChatGPT",
      summary: "通用助手",
      category: "通用助手",
    });

    expect(readRecentTools()).toEqual([
      expect.objectContaining({
        slug: "chatgpt",
        name: "ChatGPT",
        summary: "通用助手",
        category: "通用助手",
      }),
    ]);
  });

  it("deduplicates and keeps the latest visit first", () => {
    rememberRecentTool({ slug: "chatgpt", name: "ChatGPT", summary: "旧描述" });
    rememberRecentTool({ slug: "gamma", name: "Gamma", summary: "PPT" });
    rememberRecentTool({ slug: "chatgpt", name: "ChatGPT", summary: "新描述" });

    const items = readRecentTools();
    expect(items.map((item) => item.slug)).toEqual(["chatgpt", "gamma"]);
    expect(items[0].summary).toBe("新描述");
  });

  it("ignores malformed storage", () => {
    window.localStorage.setItem(RECENT_TOOLS_KEY, "not json");

    expect(readRecentTools()).toEqual([]);
  });
});
