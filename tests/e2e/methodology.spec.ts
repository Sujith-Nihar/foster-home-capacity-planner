import { test, expect } from "@playwright/test";

test.describe("methodology page", () => {
  test("documents definitions, explicit callouts, and data version metadata", async ({ page }) => {
    await page.goto("/methodology");

    await expect(page.getByRole("heading", { name: "Methodology", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How to read this application" })).toBeVisible();
    await expect(page.getByText(/not available beds, vacancies, or guaranteed placement capacity/i)).toBeVisible();
    await expect(page.getByText(/not a prediction of closure/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Data version" })).toBeVisible();
    await expect(page.getByText("Dataset version")).toBeVisible();
    await expect(page.getByText("Source hash")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Engagement rate" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Privacy choices" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Limitations" })).toBeVisible();
  });

  test("is linked from analytical pages", async ({ page }) => {
    for (const path of ["/", "/recruitment", "/retention"]) {
      await page.goto(path);
      await expect(
        page.getByRole("main").getByRole("link", { name: /methodology/i }),
      ).toBeVisible();
    }
  });
});
