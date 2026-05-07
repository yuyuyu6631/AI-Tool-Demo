import { buildComparisonSlug, normalizeComparisonSlugs, parseComparisonSlug } from "../compare-utils";

describe("compare-utils", () => {
  it("normalizes and sorts selected slugs", () => {
    expect(normalizeComparisonSlugs(["claude", "chatgpt", "claude"])).toEqual(["chatgpt", "claude"]);
  });

  it("builds canonical compare slugs for 2-4 tools", () => {
    expect(buildComparisonSlug(["claude", "chatgpt"])).toBe("chatgpt-vs-claude");
    expect(buildComparisonSlug(["gamma", "claude", "chatgpt"])).toBe("chatgpt-vs-claude-vs-gamma");
    expect(buildComparisonSlug(["gamma", "claude", "chatgpt", "canva"])).toBe("canva-vs-chatgpt-vs-claude-vs-gamma");
    expect(buildComparisonSlug(["chatgpt"])).toBeNull();
    expect(buildComparisonSlug(["a", "b", "c", "d", "e"])).toBeNull();
  });

  it("parses compare slugs into raw slugs", () => {
    expect(parseComparisonSlug("chatgpt-vs-claude-vs-gamma")).toEqual(["chatgpt", "claude", "gamma"]);
  });
});
