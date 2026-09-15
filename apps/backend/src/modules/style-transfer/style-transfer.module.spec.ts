import { Test } from "@nestjs/testing";
import { StyleTransferModule } from "./style-transfer.module";
import { StyleTransferService } from "./style-transfer.service";
import { StyleTransferController } from "./style-transfer.controller";

describe("StyleTransferModule (DI wiring)", () => {
  it("resolves the service and controller from the real module graph", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [StyleTransferModule],
    }).compile();

    expect(moduleRef.get(StyleTransferService)).toBeDefined();
    expect(moduleRef.get(StyleTransferController)).toBeDefined();

    await moduleRef.close();
  });
});
