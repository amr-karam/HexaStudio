import { Module } from "@nestjs/common";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";

/**
 * HEXA Studio Backend Prometheus Telemetry Module
 * Exposes Prometheus-compatible metrics at GET /api/v1/metrics for Grafana dashboards.
 */
@Module({
  imports: [
    PrometheusModule.register({
      path: "/metrics",
    }),
  ],
})
export class MetricsModule {}
