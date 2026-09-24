import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { OdooModule } from "../odoo/odoo.module";
import { AIModule } from "../ai/ai.module";

@Module({
  imports: [OdooModule, AIModule],
  controllers: [HealthController],
})
export class HealthModule {}
