import { Test } from "@nestjs/testing";
import { CostEstimatorModule } from "./cost-estimator.module";
import { CostEstimatorService } from "./cost-estimator.service";
import { CostEstimatorController } from "./cost-estimator.controller";

describe("CostEstimatorModule (DI wiring)", () => {
  it("resolves the service and controller from the real module graph", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CostEstimatorModule],
    }).compile();

    expect(moduleRef.get(CostEstimatorService)).toBeDefined();
    expect(moduleRef.get(CostEstimatorController)).toBeDefined();

    await moduleRef.close();
  });
});
