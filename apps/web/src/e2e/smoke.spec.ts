import { expect, test } from "@playwright/test";

test("demo smoke: search from home and open a tool detail", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("比如：毕业论文排版 / 答辩 PPT / Excel 数据分析").fill("做答辩 PPT");
  await page.getByRole("button", { name: "开始找" }).click();

  await expect(page).toHaveURL(/\/tools\?/);
  await expect(page).toHaveURL(/mode=ai/);
  await expect(page.getByRole("heading", { name: "搜索结果" })).toBeVisible();
  await expect(page.getByText("AI 理解")).toBeVisible();

  await page.getByRole("link", { name: /^详情$/ }).first().click();
  await expect(page.getByText("评测结论", { exact: true })).toBeVisible();
  await expect(page.getByText("信息来源")).toBeVisible();
});
