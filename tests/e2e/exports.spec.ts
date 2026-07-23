import { test, expect } from "@playwright/test";

test.describe("filtered exports", () => {
  test("exports recruitment counties with active filters", async ({ request }) => {
    const response = await request.get(
      "/api/exports/recruitment?priority=High&sort=children_per_active_provider&direction=desc",
    );

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("text/csv");
    const body = await response.text();
    expect(body.length).toBeGreaterThan(0);
    expect(body.toLowerCase()).toContain("county");
    expect(body.toLowerCase()).not.toContain("id_child");
  });

  test("exports retention providers with active filters", async ({ request }) => {
    const response = await request.get("/api/exports/retention?providerId=500021");
    const body = await response.text();

    expect(response.ok(), `status=${response.status()} body=${body}`).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("text/csv");
    expect(body.length).toBeGreaterThan(0);
    expect(body).toContain("500021");
    expect(body.toLowerCase()).not.toContain("id_child");
  });
});
