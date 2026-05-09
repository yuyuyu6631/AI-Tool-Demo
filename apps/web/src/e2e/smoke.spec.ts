import { expect, test } from "@playwright/test";

test("demo smoke: search from home and open a tool detail", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("比如：做销售周报 PPT / 分析投放数据 / 修复前端报错").fill("做答辩 PPT");
  await page.getByRole("button", { name: "找工具" }).click();

  await expect(page).toHaveURL(/\/tools\?/);
  await expect(page).toHaveURL(/mode=ai/);
  await expect(page.getByRole("heading", { name: "搜索结果" })).toBeVisible();
  await expect(page.getByText("AI 理解")).toHaveCount(0);
  await expect(page.getByText("查看 AI 推荐报告")).toHaveCount(0);

  await page.getByRole("link", { name: /^详情$/ }).first().click();
  await expect(page.getByText("评测结论", { exact: true })).toBeVisible();
  await expect(page.getByText("信息来源")).toBeVisible();
});
