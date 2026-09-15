import { MinioUploadModule } from "./minio-upload.module";
import { MinioUploadService } from "./minio-upload.service";
import { MinioUploadController } from "./minio-upload.controller";
import { StorageModule } from "../storage/storage.module";
import { OdooModule } from "../odoo/odoo.module";
import { RealtimeModule } from "../realtime/realtime.module";

/**
 * Metadata-level wiring assertions.
 *
 * A full `Test.createTestingModule({ imports: [MinioUploadModule] })`
 * cannot compile in isolation: OdooModule → RealtimeModule → AIModule →
 * VectorModule → AgentsModule contains a circular import that resolves to
 * `undefined` outside the full AppModule load order (pre-existing tech
 * debt, see PROJECT_STATUS). These assertions still pin the exact contract
 * that caused the StyleTransferModule boot failure — every injected
 * dependency must be covered by a declared module import.
 */
describe("MinioUploadModule (DI wiring)", () => {
  const imports: unknown[] = Reflect.getMetadata("imports", MinioUploadModule);
  const providers: unknown[] = Reflect.getMetadata("providers", MinioUploadModule);
  const controllers: unknown[] = Reflect.getMetadata("controllers", MinioUploadModule);

  it("imports the modules that provide the service constructor dependencies", () => {
    expect(imports).toContain(StorageModule); // MinioService
    expect(imports).toContain(OdooModule); // OdooApiService
    expect(imports).toContain(RealtimeModule); // RealtimeGateway
  });

  it("registers the service and controller", () => {
    expect(providers).toContain(MinioUploadService);
    expect(controllers).toContain(MinioUploadController);
  });
});
