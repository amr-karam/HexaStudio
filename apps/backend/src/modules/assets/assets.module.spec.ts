import { Test } from "@nestjs/testing";
import { AssetsModule } from "./assets.module";
import { AssetsController } from "./assets.controller";

describe("AssetsModule (DI wiring)", () => {
  it("resolves the controller from the real module graph", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AssetsModule],
    }).compile();

    expect(moduleRef.get(AssetsController)).toBeDefined();

    await moduleRef.close();
  });
});
