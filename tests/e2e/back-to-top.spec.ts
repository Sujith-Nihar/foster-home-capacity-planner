import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/recruitment", "/recruitment/Cook", "/retention", "/providers/500001", "/methodology"];

for (const route of ROUTES) {
  test(`shows a single back-to-top control on ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole("button", { name: "Back to top" })).toHaveCount(1);
  });
}

test.describe("back to top", () => {
  test("appears after scrolling and returns to the top of the page", async ({ page }) => {
    await page.goto("/recruitment");

    const backToTop = page.getByRole("button", { name: "Back to top" });
    await expect(backToTop).toHaveClass(/back-to-top--hidden/);

    await page.evaluate(() => {
      window.scrollTo(0, 800);
      window.dispatchEvent(new Event("scroll"));
    });

    await expect(backToTop).not.toHaveClass(/back-to-top--hidden/);
    await backToTop.click();

    await expect
      .poll(async () => page.evaluate(() => window.scrollY))
      .toBeLessThanOrEqual(2);
  });
});
