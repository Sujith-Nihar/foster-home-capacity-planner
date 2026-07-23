import { test, expect } from "@playwright/test";

test.describe("keyboard navigation", () => {
  test("supports tab focus to primary navigation and visible focus styles", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();

    const outlineWidth = await focused.evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return styles.outlineWidth;
    });
    expect(outlineWidth).not.toBe("0px");
  });

  test("allows keyboard activation of the recruitment nav link", async ({ page }) => {
    await page.goto("/");
    const recruitmentLink = page.getByRole("link", { name: "Recruitment", exact: true });
    await recruitmentLink.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/recruitment$/);
    await expect(page.getByRole("heading", { name: "Recruitment", exact: true })).toBeVisible();
  });
});

test.describe("table accessibility", () => {
  test("retention provider table exposes column headers", async ({ page }) => {
    await page.goto("/retention");
    await expect(page.getByRole("columnheader", { name: /Provider ID/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /Outreach priority/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /Reasons/i })).toBeVisible();
  });

  test("recruitment county table exposes column headers", async ({ page }) => {
    await page.goto("/recruitment");
    await expect(page.getByRole("columnheader", { name: "County" }).first()).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /Priority/i }).first()).toBeVisible();
  });
});
