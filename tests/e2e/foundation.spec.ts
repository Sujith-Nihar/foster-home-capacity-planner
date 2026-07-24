import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("foundation routes", () => {
  test("overview route loads with noindex metadata", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Translate foster-home data into clear action/i }),
    ).toBeVisible();

    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toMatch(/noindex/i);
    expect(robots).toMatch(/nofollow/i);
  });

  test("primary navigation routes are reachable", async ({ page }) => {
    await page.goto("/");

    const routes = [
      {
        label: "Recruitment",
        heading: "Focus recruitment where children and communities need it most.",
      },
      {
        label: "Retention",
        heading: "Support the foster homes already serving Illinois families.",
      },
      {
        label: "Methodology",
        heading: "Understand how metrics are defined and what they can support.",
      },
    ] as const;

    for (const route of routes) {
      await page.getByRole("link", { name: route.label, exact: true }).click();
      await expect(page.getByRole("heading", { name: new RegExp(route.heading.replace(/\.$/, ""), "i") })).toBeVisible();
    }
  });

  test("overview passes basic axe checks", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("heading", { level: 1 }).first().waitFor();

    const reveals = page.locator(".section-reveal--enhanced");
    const count = await reveals.count();
    for (let index = 0; index < count; index += 1) {
      await reveals.nth(index).scrollIntoViewIfNeeded();
    }
    await page.waitForFunction(() =>
      [...document.querySelectorAll(".section-reveal--enhanced")].every((element) =>
        element.classList.contains("section-reveal--visible"),
      ),
    );
    await page.evaluate(() => window.scrollTo(0, 0));

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
