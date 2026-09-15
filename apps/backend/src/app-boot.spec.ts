import { Test } from "@nestjs/testing";
import { AppModule } from "./app.module";

/**
 * Full-graph DI boot test.
 *
 * Compiles the real AppModule dependency graph (no HTTP listener, no
 * onModuleInit hooks — `.compile()` only resolves providers). This is the
 * only automated proof that the backend actually boots: several modules
 * (Agents/Realtime/AI/Vector/…) form circular import chains that resolve
 * only in specific load orders, and a missing `HttpModule`-style import
 * (cf. StyleTransferModule) surfaces here instead of in production.
 */
describe("AppModule (full-graph DI boot)", () => {
  it(
    "compiles the entire dependency graph without unresolvable providers",
    async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      expect(moduleRef).toBeDefined();

      await moduleRef.close();
    },
    180000
  );
});
