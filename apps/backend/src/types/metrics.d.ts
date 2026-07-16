declare module '@willsoto/nestjs-prometheus' {
  import { DynamicModule } from '@nestjs/common';
  interface PrometheusOptions {
    path?: string;
  }
  export class PrometheusModule {
    static register(options?: PrometheusOptions): DynamicModule;
  }
}
