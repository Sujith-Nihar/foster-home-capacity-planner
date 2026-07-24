export type PerformanceCacheStatus = "hit" | "miss" | "n/a";

export type PerformanceLogEntry = {
  route: string;
  operation: string;
  duration_ms: number;
  row_count?: number;
  success: boolean;
  cache: PerformanceCacheStatus;
};

export function isPerformanceLoggingEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.PERFORMANCE_LOGGING_ENABLED === "true"
  );
}

let activeRoute = "unknown";

export function setPerformanceRoute(route: string): void {
  activeRoute = route;
}

export function getPerformanceRoute(): string {
  return activeRoute;
}

export async function timedOperation<T>(
  operation: string,
  fn: () => Promise<T>,
  options: {
    rowCount?: (result: T) => number;
    cache?: PerformanceCacheStatus;
  } = {},
): Promise<T> {
  if (!isPerformanceLoggingEnabled()) {
    return fn();
  }

  const startedAt = performance.now();
  try {
    const result = await fn();
    logPerformance({
      route: activeRoute,
      operation,
      duration_ms: Math.round(performance.now() - startedAt),
      row_count: options.rowCount?.(result),
      success: true,
      cache: options.cache ?? "n/a",
    });
    return result;
  } catch (error) {
    logPerformance({
      route: activeRoute,
      operation,
      duration_ms: Math.round(performance.now() - startedAt),
      success: false,
      cache: options.cache ?? "n/a",
    });
    throw error;
  }
}

function logPerformance(entry: PerformanceLogEntry): void {
  console.info(JSON.stringify(entry));
}
