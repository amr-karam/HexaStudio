import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { OdooModule } from "../odoo/odoo.module";

@Module({
  imports: [OdooModule],
  controllers: [HealthController],
})
export class HealthModule {}
