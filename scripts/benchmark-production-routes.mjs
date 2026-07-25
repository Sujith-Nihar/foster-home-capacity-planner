#!/usr/bin/env node

import { BENCHMARK_ROUTES } from "./benchmark-routes.config.mjs";

const REQUESTS_PER_ROUTE = Number.parseInt(process.env.BENCHMARK_REQUESTS ?? "3", 10);
const BASE_URL = process.env.BENCHMARK_BASE_URL ?? "http://127.0.0.1:3000";

async function measureRoute(path) {
  const results = [];

  for (let attempt = 1; attempt <= REQUESTS_PER_ROUTE; attempt += 1) {
    const startedAt = performance.now();
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: "text/html" },
      redirect: "manual",
    });
    const body = await response.text();
    const totalMs = performance.now() - startedAt;
    const serverTiming = response.headers.get("server-timing");
    const ttfbHeader = serverTiming?.match(/total;dur=([\d.]+)/)?.[1];

    results.push({
      attempt,
      status: response.status,
      total_ms: Math.round(totalMs),
      ttfb_ms: ttfbHeader ? Math.round(Number(ttfbHeader)) : null,
      bytes: body.length,
    });
  }

  const cold = results[0];
  const warm = results.slice(1);
  const warmAverage =
    warm.length === 0
      ? cold.total_ms
      : Math.round(warm.reduce((sum, entry) => sum + entry.total_ms, 0) / warm.length);

  return {
    path,
    cold_total_ms: cold.total_ms,
    warm_average_ms: warmAverage,
    warm_runs: warm.map((entry) => entry.total_ms),
    cold_ttfb_ms: cold.ttfb_ms,
    status: cold.status,
    bytes: cold.bytes,
  };
}

async function main() {
  const summary = [];

  for (const path of BENCHMARK_ROUTES) {
    summary.push(await measureRoute(path));
  }

  const slowest = [...summary]
    .filter((entry) => entry.status >= 200 && entry.status < 400)
    .sort((left, right) => right.warm_average_ms - left.warm_average_ms)
    .slice(0, 5);

  console.log(
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        requestsPerRoute: REQUESTS_PER_ROUTE,
        summary,
        slowestWarmRoutes: slowest,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
