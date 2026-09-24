import { Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { CostEstimatorModule } from "./cost-estimator.module";
import { CostEstimatorService } from "./cost-estimator.service";
import { CostEstimatorController } from "./cost-estimator.controller";
import { AuthModule } from "../auth/auth.module";
import { SecurityModule } from "../security/security.module";
import { RedisModule } from "../storage/redis.module";

describe("CostEstimatorModule (DI wiring)", () => {
  it("resolves the service and controller from the real module graph", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        SecurityModule,
        RedisModule,
        AuthModule,
        CostEstimatorModule,
      ],
    }).compile();

    expect(moduleRef.get(CostEstimatorService)).toBeDefined();
    expect(moduleRef.get(CostEstimatorController)).toBeDefined();

    await moduleRef.close();
  });
});
