import { Injectable } from '@nestjs/common';
import { Gauge, Counter, register } from 'prom-client';

@Injectable()
export class DesignMetricsService {
  private readonly luxuryScoreGauge: Gauge;
  private readonly violationsCounter: Counter;
  private readonly approvalGauge: Gauge;

  constructor() {
    this.luxuryScoreGauge = new Gauge({
      name: 'hexa_design_luxury_score',
      help: 'Current luxury score of audited components',
      labelNames: ['component'],
    });

    this.violationsCounter = new Counter({
      name: 'hexa_design_violations_total',
      help: 'Total count of design slop violations detected',
      labelNames: ['severity', 'token'],
    });

    this.approvalGauge = new Gauge({
      name: 'hexa_design_approval_rate',
      help: 'Approval rate of components passing the luxury gate',
      labelNames: ['component'],
    });

    // Register metrics with Prometheus default registry
    register.registerMetric(this.luxuryScoreGauge);
    register.registerMetric(this.violationsCounter);
    register.registerMetric(this.approvalGauge);
  }

  recordAudit(component: string, score: number, approved: boolean, violations: Array<{ token: string; severity: string }>) {
    this.luxuryScoreGauge.set({ component }, score);
    this.approvalGauge.set({ component }, approved ? 1 : 0);
    
    violations.forEach(v => {
      this.violationsCounter.inc({ severity: v.severity, token: v.token });
    });
  }
}
