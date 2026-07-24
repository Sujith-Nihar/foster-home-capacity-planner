import { test, expect } from "@playwright/test";

import { FOSTER_INSIGHTS_LOGO_INTRINSIC } from "@/components/layout/foster-insights-logo";

const VIEWPORTS = [
  { name: "1600px", width: 1600, height: 900 },
  { name: "1440px", width: 1440, height: 900 },
  { name: "1280px", width: 1280, height: 900 },
  { name: "1024px", width: 1024, height: 900 },
  { name: "768px", width: 768, height: 1024 },
  { name: "390px", width: 390, height: 844 },
] as const;

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

test.describe("application header", () => {
  for (const viewport of VIEWPORTS) {
    test(`renders official logo without overflow at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      const logo = page.getByRole("link", {
        name: "Foster Insights — Capacity Planner overview",
      });
      await expect(logo).toBeVisible();
      await expect(logo.getByRole("img", { name: "Foster Insights" })).toBeVisible();
      await expect(page.getByText("FOSTER INSIGHTS", { exact: true })).toHaveCount(0);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("logo preserves natural aspect ratio and links to overview", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const logoImage = page.getByRole("img", { name: "Foster Insights" });
    const box = await logoImage.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      const renderedRatio = box.width / box.height;
      expect(renderedRatio).toBeGreaterThan(3.1);
      expect(renderedRatio).toBeLessThan(3.45);
      expect(Math.abs(renderedRatio - FOSTER_INSIGHTS_LOGO_INTRINSIC.aspectRatio)).toBeLessThan(0.15);
    }

    await page.getByRole("link", { name: "Foster Insights — Capacity Planner overview" }).click();
    await expect(page).toHaveURL("/");
  });

  test("primary navigation routes work with active state", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const routes = [
      { label: "Overview", href: "/", heading: /Translate foster-home data into clear action/i },
      {
        label: "Recruitment",
        href: "/recruitment",
        heading: /Focus recruitment where children and communities need it most/i,
      },
      {
        label: "Retention",
        href: "/retention",
        heading: /Support the foster homes already serving Illinois families/i,
      },
      {
        label: "Methodology",
        href: "/methodology",
        heading: /Understand how metrics are defined/i,
      },
    ] as const;

    for (const route of routes) {
      const nav = page.getByRole("navigation", { name: "Primary navigation" });
      await nav.getByRole("link", { name: route.label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${route.href === "/" ? "/$" : route.href}`));
      await expect(
        nav.getByRole("link", { name: route.label, exact: true }),
      ).toHaveAttribute("aria-current", "page");
      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
    }
  });

  test("mobile menu opens, navigates, and returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const menuButton = page.locator('[aria-controls="mobile-navigation-sheet"]');
    await expect(menuButton).toHaveAttribute("aria-label", "Open navigation");
    await menuButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-label", "Close navigation");
    await expect(dialog.getByRole("heading", { name: "Illinois DCFS Capacity Planner" })).toBeVisible();
    await expect(dialog.getByText("Reporting date:")).toBeVisible();

    await dialog.getByRole("link", { name: "Recruitment", exact: true }).click();
    await expect(page).toHaveURL(/\/recruitment$/);
    await expect(menuButton).toBeFocused();
  });

  test("loads logo asset without console or network errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    page.on("requestfailed", (request) => {
      const failure = request.failure()?.errorText;
      if (failure === "net::ERR_ABORTED") {
        return;
      }
      failedRequests.push(`${request.method()} ${request.url()} - ${failure}`);
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("img", { name: "Foster Insights" })).toBeVisible();

    const logoResponse = await page.request.get("/brand/foster-insights-logo.webp");
    expect(logoResponse.ok()).toBeTruthy();

    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
});
