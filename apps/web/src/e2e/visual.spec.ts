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

    const heading = page.getByRole("heading", { name: "同一个任务，看看哪个 AI 真能做好" });
    const search = page.getByPlaceholder("比如：毕业论文排版 / 答辩 PPT / Excel 数据分析 / 代码跑不通");
    const workflow = page.getByTestId("home-signal-radar");
    const toolsEntry = page.getByRole("link", { name: /逛工具库/ });

    await expect(heading).toBeVisible();
    await expect(search).toBeVisible();
    await expect(workflow).toBeVisible();
    await expect(toolsEntry).toBeVisible();
    await expect(page.getByText("当前没有可展示的工具")).toHaveCount(0);

    const headingBox = await heading.boundingBox();
    const searchBox = await search.boundingBox();
    const workflowBox = await workflow.boundingBox();
    expect(headingBox).not.toBeNull();
    expect(searchBox).not.toBeNull();
    expect(workflowBox).not.toBeNull();

    expect(searchBox!.y).toBeGreaterThan(headingBox!.y);
    expect(searchBox!.height).toBeGreaterThan(40);
    expect(workflowBox!.width).toBeGreaterThan(160);
    expect(workflowBox!.height).toBeGreaterThan(20);

    if (item.width < 768) {
      expect(searchBox!.y + searchBox!.height).toBeLessThan(workflowBox!.y + workflowBox!.height);
    }
  });
}
