import { test, expect } from "@playwright/test";

test.describe("Homepage-first navigation", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("loads homepage and exposes primary actions", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveTitle(/星点评/);
    await expect(page.locator("nav").getByText("首页")).toBeVisible();
    await expect(page.getByRole("button", { name: "开始找工具" })).toBeVisible();
    await expect(page.getByText("查看这一类").first()).toBeVisible();
  });

  test("search result, detail, and compare flow still work from homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder("告诉我你的任务，比如做 PPT、写文案、找 AI 助手").fill("写作");
    await page.getByRole("button", { name: "开始找工具" }).click();

    await expect(page).toHaveURL(/\/\?q=%E5%86%99%E4%BD%9C|\/\?q=写作/);
    await expect(page.getByText("搜索结果")).toBeVisible();

    const cards = page.locator('[data-testid="tool-card"]');
    await cards.nth(0).getByRole("button", { name: "加入对比" }).click();
    await cards.nth(1).getByRole("button", { name: "加入对比" }).click();
    await page.getByRole("link", { name: "开始对比" }).click();

    await expect(page).toHaveURL(/\/compare\//);
  });

  test("legacy tools path redirects back to homepage", async ({ page }) => {
    await page.goto("/tools", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/$/);
  });
});
