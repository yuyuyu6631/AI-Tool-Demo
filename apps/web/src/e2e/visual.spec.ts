import { expect, test } from "@playwright/test";

const cases = [
  { name: "home-1280", path: "/", width: 1280, height: 1200 },
  { name: "home-1440", path: "/", width: 1440, height: 1200 },
  { name: "home-1920", path: "/", width: 1920, height: 1280 },
  { name: "home-search-390", path: "/?q=AI", width: 390, height: 1100 },
];

for (const item of cases) {
  test(`visual layout ${item.name}`, async ({ page }) => {
    await page.setViewportSize({ width: item.width, height: item.height });
    await page.goto(item.path, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    const heading = page.getByRole("heading", { name: "按任务找到合适的 AI 工具" });
    const search = page.getByPlaceholder("比如：做销售周报 PPT / 分析投放数据 / 修复前端报错");
    const quickTask = page.getByRole("link", { name: "写作润色" });
    const toolsEntry = page.getByRole("link", { name: /逛工具库/ });

    await expect(heading).toBeVisible();
    await expect(search).toBeVisible();
    await expect(quickTask).toBeVisible();
    await expect(toolsEntry).toBeVisible();
    await expect(page.getByText("当前没有可展示的工具")).toHaveCount(0);

    const headingBox = await heading.boundingBox();
    const searchBox = await search.boundingBox();
    const quickTaskBox = await quickTask.boundingBox();
    expect(headingBox).not.toBeNull();
    expect(searchBox).not.toBeNull();
    expect(quickTaskBox).not.toBeNull();

    expect(searchBox!.y).toBeGreaterThan(headingBox!.y);
    expect(searchBox!.height).toBeGreaterThan(40);
    expect(quickTaskBox!.width).toBeGreaterThan(80);
    expect(quickTaskBox!.height).toBeGreaterThan(20);

    if (item.width < 768) {
      expect(searchBox!.y + searchBox!.height).toBeLessThan(quickTaskBox!.y + quickTaskBox!.height);
    }
  });
}
