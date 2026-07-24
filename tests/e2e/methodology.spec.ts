import { test, expect } from "@playwright/test";

test.describe("methodology page", () => {
  test("documents definitions, explicit callouts, and data version metadata", async ({ page }) => {
    await page.goto("/methodology");

    await expect(
      page.getByRole("heading", { name: /Understand how metrics are defined/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "How to read this application" })).toBeVisible();
    await expect(page.getByText(/not a count of available beds or open placements/i)).toBeVisible();
    await expect(page.getByText(/does not predict closure/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Data version" })).toBeVisible();
    await expect(page.getByText("Dataset version")).toBeVisible();
    await expect(page.getByText("Source hash")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Planning rules selected for this prototype/i })).toBeVisible();
    await expect(page.getByText(/were not supplied by DCFS/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Limitations and appropriate use/i })).toBeVisible();
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
