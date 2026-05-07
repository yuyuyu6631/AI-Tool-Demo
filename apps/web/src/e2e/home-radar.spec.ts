import { expect, test } from "@playwright/test";

const HOME_SEARCH_PLACEHOLDER = "比如：毕业论文排版 / 答辩 PPT / Excel 数据分析 / 代码跑不通";

test("home hero renders semantic search and the recommendation workflow", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: "同一个任务，看看哪个 AI 真能做好" })).toBeVisible();
  await expect(page.getByPlaceholder(HOME_SEARCH_PLACEHOLDER)).toBeVisible();
  await expect(page.getByRole("button", { name: "拆解任务" })).toBeVisible();
  await expect(page.getByTestId("home-signal-radar")).toBeVisible();
  await expect(page.getByText("把任务说清楚，再选真正能用的 AI")).toBeVisible();
  await expect(page.getByRole("link", { name: /问题实测 看本周实测/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /工具库 逛工具库/ })).toBeVisible();
  await expect(page.getByLabel("快捷任务入口").getByText("论文改文")).toBeVisible();
  await expect(page.getByText("直接输入你要完成的任务")).toHaveCount(0);
});

test("home first viewport keeps search above workflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const heading = page.getByRole("heading", { name: "同一个任务，看看哪个 AI 真能做好" });
  const search = page.getByPlaceholder(HOME_SEARCH_PLACEHOLDER);
  const workflow = page.getByTestId("home-signal-radar");
  await expect(heading).toBeVisible();
  await expect(search).toBeVisible();
  await expect(workflow).toBeVisible();

  const searchBox = await search.boundingBox();
  const workflowBox = await workflow.boundingBox();
  expect(searchBox).not.toBeNull();
  expect(workflowBox).not.toBeNull();
  expect(searchBox!.y + searchBox!.height).toBeLessThan(workflowBox!.y + workflowBox!.height);
});

test("semantic search updates visible understanding state", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder(HOME_SEARCH_PLACEHOLDER).fill("做答辩 PPT 用什么 AI");
  await page.getByRole("button", { name: "拆解任务" }).click();

  await expect(page).toHaveURL(/\/tools\?/);
  await expect(page).toHaveURL(/mode=ai/);
  await expect(page).toHaveURL(/q=.*%E7%AD%94%E8%BE%A9.*PPT/);
  await expect(page.getByRole("heading", { name: "搜索结果" })).toBeVisible();
  await expect(page.getByText("AI 理解")).toBeVisible();
  await expect(page.getByText(/找到 \d+ 个结果/)).toBeVisible();
});

test("tool detail opened from the homepage tools entry leads with third-party review fields", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.getByRole("link", { name: /逛工具库/ }).click();
  await expect(page).toHaveURL(/\/tools/);
  await page.getByRole("link", { name: /^详情$/ }).first().click();
  await expect(page).toHaveURL(/\/tools\/.+/);
  await expect(page.getByText("评测结论", { exact: true })).toBeVisible();
  await expect(page.getByText("先看缺陷 / 限制")).toBeVisible();
  await expect(page.getByText("核心特点")).toBeVisible();
  await expect(page.getByRole("heading", { name: "适合人群" })).toBeVisible();
  await expect(page.getByText("优惠 / 免费额度")).toBeVisible();
  await expect(page.getByRole("heading", { name: "用户评论" })).toBeVisible();
});
