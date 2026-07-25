import { test, expect } from "@playwright/test";

test.describe("favicon and metadata", () => {
  test("serves Foster Insights favicon assets without the default triangle icon", async ({
    page,
    request,
  }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Foster Home Capacity Planner \| Foster Insights/);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      "Illinois foster-home recruitment and provider-retention planning workspace.",
    );

    const iconLinks = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').all();
    expect(iconLinks.length).toBeGreaterThan(0);

    const hrefs = await Promise.all(iconLinks.map((link) => link.getAttribute("href")));
    for (const href of hrefs) {
      expect(href).toBeTruthy();
      const response = await request.get(new URL(href!, page.url()).toString());
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toMatch(/image\/(png|x-icon|vnd\.microsoft\.icon)/);
    }

    const triangleResponse = await request.get(new URL("/favicon.ico?check=triangle", page.url()).toString());
    expect(triangleResponse.status()).toBe(200);
    const iconBytes = Buffer.from(await triangleResponse.body());
    expect(iconBytes.length).toBeGreaterThan(500);
  });
});
