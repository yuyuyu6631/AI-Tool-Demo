import { expect, test } from "@playwright/test";

test("core directory path, rankings, and scenarios use live routes", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "开始筛选" })).toBeVisible();

  await page.getByPlaceholder("想写文案 / 做海报 / 写代码？丢需求我帮你挑工具").fill("AI");
  await page.getByRole("button", { name: "开始筛选" }).click();
  await expect(page).toHaveURL(/\/tools\?q=AI/);
  await expect(page.getByRole("heading", { name: "搜索结果" })).toBeVisible();

  const detailLink = page.getByRole("link", { name: "查看详情" }).first();
  await detailLink.click();
  await expect(page).toHaveURL(/\/tools\/.+/);

  const externalLink = page.getByRole("link", { name: /访问官网/ });
  await expect(externalLink).toBeVisible();

  await page.goto("/rankings", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "严选榜单" })).toBeVisible();

  await page.goto("/scenarios", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "按真实人群和场景找工具" })).toBeVisible();
});
