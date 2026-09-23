import { Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { StyleTransferModule } from "./style-transfer.module";
import { StyleTransferService } from "./style-transfer.service";
import { StyleTransferController } from "./style-transfer.controller";
import { AuthModule } from "../auth/auth.module";
import { SecurityModule } from "../security/security.module";
import { RedisModule } from "../storage/redis.module";

describe("StyleTransferModule (DI wiring)", () => {
  it("resolves the service and controller from the real module graph", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        SecurityModule,
        RedisModule,
        AuthModule,
        StyleTransferModule,
      ],
    }).compile();

    expect(moduleRef.get(StyleTransferService)).toBeDefined();
    expect(moduleRef.get(StyleTransferController)).toBeDefined();

    await moduleRef.close();
  });
});
