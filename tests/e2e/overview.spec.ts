import { test, expect } from "@playwright/test";

test.describe("overview page", () => {
  test("renders statewide KPIs, attention panel, and chart sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Overview", exact: true })).toBeVisible();
    await expect(page.getByRole("banner", { name: "Application header" }).getByText("Reporting date:")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Statewide snapshot" })).toBeVisible();
    await expect(page.getByText("Current children in care", { exact: true })).toBeVisible();
    await expect(page.getByText("High-priority outreach providers", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What needs attention" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Top recruitment-pressure counties" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "License expirations by month" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Retention outreach priority distribution" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Placement-type context" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Largest-county comparison" })).toBeVisible();
  });

  test("links recruitment and retention KPI cards to workflow pages", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /Current foster-home placements/i }).click();
    await expect(page).toHaveURL(/\/recruitment$/);
    await expect(page.getByRole("heading", { name: "Recruitment", exact: true })).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: /High-priority outreach providers/i }).click();
    await expect(page).toHaveURL(/\/retention\?priority=High$/);
  });
});
