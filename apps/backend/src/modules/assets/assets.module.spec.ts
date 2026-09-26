import { Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AssetsModule } from "./assets.module";
import { AssetsController } from "./assets.controller";
import { AuthModule } from "../auth/auth.module";
import { SecurityModule } from "../security/security.module";
import { RedisModule } from "../storage/redis.module";

describe("AssetsModule (DI wiring)", () => {
  it("resolves the controller from the real module graph", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        SecurityModule,
        RedisModule,
        AuthModule,
        AssetsModule,
      ],
    }).compile();

    expect(moduleRef.get(AssetsController)).toBeDefined();

    await moduleRef.close();
  });
});
