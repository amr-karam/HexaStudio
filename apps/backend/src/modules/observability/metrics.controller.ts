import { Controller, Get, Header, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('observability')
@Controller({ path: 'metrics', version: ['1', VERSION_NEUTRAL] })
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  @ApiOperation({ summary: 'Prometheus metrics endpoint for Grafana' })
  getMetrics(): string {
    return this.metricsService.getMetricsString();
  }
}
