/**
 * assets.module.ts
 * NestJS module — 3D Asset Marketplace (self-hosted)
 * HEXA Studio — Sprint S022.5
 *
 * Serves glTF models from self-hosted storage.
 * No cloud/SaaS, no external model APIs.
 */
import { Module } from "@nestjs/common";
import { AssetsController } from "./assets.controller";

@Module({
  controllers: [AssetsController],
})
export class AssetsModule {}
