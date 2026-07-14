import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { OdooService } from "../odoo/odoo.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly odooService: OdooService) {}

  @Get()
  @ApiOperation({ summary: "Health check" })
  async check() {
    let odooStatus = "unknown";
    try {
      const isHealthy = await this.odooService.ping();
      odooStatus = isHealthy ? "ok" : "error";
    } catch {
      odooStatus = "error";
    }

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "hexastudio-api",
      dependencies: {
        odoo: odooStatus,
      },
    };
  }
}
