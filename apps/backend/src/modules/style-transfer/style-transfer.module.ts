/**
 * style-transfer.module.ts
 * NestJS module — AI Style-Transfer Renderer (local SD + ControlNet)
 * HEXA Studio — Sprint S022.3
 *
 * Self-hosted: communicates with local AUTOMATIC1111 WebUI API
 * No cloud/SaaS dependencies.
 */
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { StyleTransferService } from "./style-transfer.service";
import { StyleTransferController } from "./style-transfer.controller";

@Module({
  imports: [HttpModule],
  controllers: [StyleTransferController],
  providers: [StyleTransferService],
  exports: [StyleTransferService],
})
export class StyleTransferModule {}
