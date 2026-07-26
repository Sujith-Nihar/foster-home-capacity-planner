import { test, expect } from "@playwright/test";

test.describe("methodology page", () => {
  test("documents definitions, explicit callouts, and data snapshot metadata", async ({ page }) => {
    await page.goto("/methodology");

    await expect(
      page.getByRole("heading", {
        name: /Understand what the metrics mean and how planning categories are created/i,
      }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Important things to know" })).toBeVisible();
    await expect(
      page.getByText(/does not measure available beds, vacancies or open placements/i),
    ).toBeVisible();
    await expect(page.getByText(/not official DCFS classifications or predictions/i)).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Methodology sections" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Retention rules" })).toHaveAttribute(
      "href",
      "#methodology-retention-rules",
    );
    await expect(page.getByRole("heading", { name: "Data snapshot" })).toBeVisible();
    await expect(page.getByText("Source records processed")).toBeVisible();
    await expect(page.getByText("provider records")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Core definitions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recruitment metrics" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Retention metrics" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Suggested recruitment attention" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Suggested outreach priority" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Limitations and appropriate use/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Technical details and data lineage" }),
    ).toBeVisible();
    await expect(page.getByText("Source hash")).toHaveCount(0);
    await page.getByRole("button", { name: /Show technical details and data lineage/i }).click();
    await expect(page.getByText("Source hash")).toBeVisible();
    await expect(page.getByText(/July 1, 2026/i).first()).toBeVisible();
  });

  test("is linked from analytical pages", async ({ page }) => {
    for (const path of ["/", "/recruitment", "/retention"]) {
      await page.goto(path);
      await expect(
        page.getByRole("main").getByRole("link", { name: /methodology/i }).first(),
      ).toBeVisible();
    }
  });
});
