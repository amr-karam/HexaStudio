import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private activeSockets = 0;

  incrementRequests() {
    this.requestCount++;
  }

  setSocketCount(count: number) {
    this.activeSockets = count;
  }

  getMetricsString(): string {
    const memory = process.memoryUsage();
    return `# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total ${process.cpuUsage().user / 1000000}

# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes ${memory.rss}

# HELP hexa_http_requests_total Total HTTP requests handled.
# TYPE hexa_http_requests_total counter
hexa_http_requests_total ${this.requestCount}

# HELP hexa_active_websocket_connections Current active portal WebSocket connections.
# TYPE hexa_active_websocket_connections gauge
hexa_active_websocket_connections ${this.activeSockets}
`;
  }
}
