/**
 * Metrics Collector — V9.0
 */

interface AggregatedMetrics {
  totalRequests: number;
  errorRequests: number;
  latencies: number[];
  retryCount: number;
  dependencyFailures: number;
}

const metricsState: AggregatedMetrics = {
  totalRequests: 0,
  errorRequests: 0,
  latencies: [],
  retryCount: 0,
  dependencyFailures: 0,
};

export function recordRequestMetric(latencyMs: number, isError: boolean = false): void {
  metricsState.totalRequests += 1;
  if (isError) metricsState.errorRequests += 1;
  metricsState.latencies.push(latencyMs);
  if (metricsState.latencies.length > 500) {
    metricsState.latencies.shift();
  }
}

export function recordRetryMetric(): void {
  metricsState.retryCount += 1;
}

export function recordDependencyFailureMetric(): void {
  metricsState.dependencyFailures += 1;
}

export function getMetricsSummary() {
  const avgLatency =
    metricsState.latencies.length > 0
      ? Math.round(
          metricsState.latencies.reduce((a, b) => a + b, 0) /
            metricsState.latencies.length
        )
      : 0;

  const successRate =
    metricsState.totalRequests > 0
      ? Number(
          (
            ((metricsState.totalRequests - metricsState.errorRequests) /
              metricsState.totalRequests) *
            100
          ).toFixed(2)
        )
      : 100;

  return {
    totalRequests: metricsState.totalRequests,
    errorRequests: metricsState.errorRequests,
    successRate,
    avgLatencyMs: avgLatency,
    retryCount: metricsState.retryCount,
    dependencyFailures: metricsState.dependencyFailures,
  };
}

export function resetMetrics(): void {
  metricsState.totalRequests = 0;
  metricsState.errorRequests = 0;
  metricsState.latencies = [];
  metricsState.retryCount = 0;
  metricsState.dependencyFailures = 0;
}
