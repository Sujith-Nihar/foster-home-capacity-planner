import { test, expect, type Page } from "@playwright/test";

const additionalAnalysisToggle = (page: Page) =>
  page.locator('[aria-controls="additional-statewide-analysis-content"]');

test.describe("overview page", () => {
  test("renders statewide snapshot, attention panel, and primary analytics", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Translate foster-home data into clear action/i }),
    ).toBeVisible();
    await expect(page.getByRole("banner", { name: "Application header" }).getByText("Reporting date:")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Statewide snapshot" })).toBeVisible();
    await expect(page.getByText("Children currently in care", { exact: true })).toBeVisible();
    await expect(page.getByText("High-priority outreach providers", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What needs attention" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Top counties for recruitment review" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View all counties" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Upcoming license expirations" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "County recruitment pressure" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Additional statewide analysis" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How priorities are created" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "License expirations by month" })).toHaveCount(0);
  });

  test("links recruitment and retention KPI cards to workflow pages", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /Children currently in foster homes/i }).click();
    await expect(page).toHaveURL(/\/recruitment$/);
    await expect(
      page.getByRole("heading", { name: /Focus recruitment where children and communities need it most/i }),
    ).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: /High-priority outreach providers/i }).click();
    await expect(page).toHaveURL(/\/retention\?priority=High$/);
  });

  test("shows five counties in the overview recruitment table", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("table tbody tr")).toHaveCount(5);
  });

  test("collapses additional analysis by default", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Retention outreach priority distribution" })).toHaveCount(0);
    await page.getByRole("button", { name: "Show analysis" }).click();
    await expect(page.getByRole("heading", { name: "Retention outreach priority distribution" })).toBeVisible();
  });

  test("toggles additional statewide analysis disclosure", async ({ page }) => {
    await page.goto("/");

    const toggle = additionalAnalysisToggle(page);
    const panel = page.locator("#additional-statewide-analysis-content");

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toHaveAttribute("aria-controls", "additional-statewide-analysis-content");
    await expect(panel).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toHaveAccessibleName("Hide analysis");
    await expect(panel).toBeVisible();
    await expect(page.getByRole("heading", { name: "Retention outreach priority distribution" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Placement-type context" })).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toHaveAccessibleName("Show analysis");
    await expect(panel).toBeHidden();
  });

  test("activates additional analysis disclosure with keyboard", async ({ page }) => {
    await page.goto("/");

    const toggle = additionalAnalysisToggle(page);
    await toggle.focus();
    await page.keyboard.press("Enter");

    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("heading", { name: "Retention outreach priority distribution" })).toBeVisible();

    await toggle.press(" ");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#additional-statewide-analysis-content")).toBeHidden();
  });

  for (const width of [1440, 768, 390] as const) {
    test(`additional analysis disclosure works at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      const toggle = additionalAnalysisToggle(page);
      await toggle.scrollIntoViewIfNeeded();
      await toggle.click();

      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(page.getByRole("heading", { name: "Retention outreach priority distribution" })).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });
  }
});
