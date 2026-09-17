/**
 * cost-estimator.module.ts
 * NestJS module — Automated Cost Estimator
 * HEXA Studio — Sprint S022.4
 */
import { Module } from "@nestjs/common";
import { CostEstimatorService } from "./cost-estimator.service";
import { CostEstimatorController } from "./cost-estimator.controller";

@Module({
  controllers: [CostEstimatorController],
  providers: [CostEstimatorService],
  exports: [CostEstimatorService],
})
export class CostEstimatorModule {}
