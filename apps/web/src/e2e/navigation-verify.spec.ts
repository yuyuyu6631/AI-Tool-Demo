import { expect, test } from "@playwright/test";

const HOME_SEARCH_PLACEHOLDER = "比如：毕业论文排版 / 答辩 PPT / Excel 数据分析";

test.describe("Homepage-first navigation", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("loads homepage and exposes primary demo actions", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveTitle(/星点评/);
    await expect(page.getByRole("heading", { name: "3 秒找到能用的 AI 工具" })).toBeVisible();
    await expect(page.getByRole("button", { name: "开始找" })).toBeVisible();
    await expect(page.getByRole("link", { name: /PPT 没思路/ })).toBeVisible();
    await expect(page.getByTestId("home-signal-radar")).toBeVisible();
    await expect(page.locator("header.site-header nav")).toBeVisible();
    await expect(page.locator("header.site-header nav").getByRole("link", { name: "按任务找" })).toBeVisible();
  });

  test("semantic search result and detail flow work from homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder(HOME_SEARCH_PLACEHOLDER).fill("写论文");
    await page.getByRole("button", { name: "开始找" }).click();

    await expect(page).toHaveURL(/\/tools\?/);
    await expect(page).toHaveURL(/mode=ai/);
    await expect(page).toHaveURL(/q=(%E5%86%99%E8%AE%BA%E6%96%87|写论文)/);

    await expect(page.getByRole("heading", { name: "搜索结果" })).toBeVisible();
    await expect(page.getByText("AI 理解")).toBeVisible();
    await expect(page.getByRole("link", { name: /^详情$/ }).first()).toBeVisible();
  });

  test("tools path opens the full directory", async ({ page }) => {
    await page.goto("/tools", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/tools/);
    await expect(page.getByRole("heading", { name: "工具目录" })).toBeVisible();
    await expect(page.getByRole("searchbox")).toBeVisible();
  });

  test("tools directory supports direct paginated browsing", async ({ page }) => {
    await page.goto("/tools?page=2&page_size=24", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/tools\?page=2&page_size=24/);
    await expect(page.getByText(/当前页：2 \/ \d+/)).toBeVisible();
    await expect(page.getByRole("navigation", { name: "分页导航" })).toBeVisible();
  });
});
