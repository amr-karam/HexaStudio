import { BadRequestException } from "@nestjs/common";
import { MinioUploadService } from "./minio-upload.service";
import type { MinioService } from "../storage/minio.service";
import type { OdooApiService } from "../odoo/odoo-api.service";
import type { RealtimeGateway } from "../realtime/realtime.gateway";
import type { UploadDto } from "./dto/upload.dto";

function makeService(odooConnect: () => Promise<unknown>) {
  const emitted: Array<{ room: string; event: string; payload: unknown }> = [];
  const service = new MinioUploadService(
    {
      getPresignedUploadUrl: async () => "https://minio.local/uploads/signed",
    } as unknown as MinioService,
    { connect: odooConnect } as unknown as OdooApiService,
    {
      emitToRoom: (room: string, event: string, payload: unknown) => {
        emitted.push({ room, event, payload });
      },
    } as unknown as RealtimeGateway
  );
  return { service, emitted };
}

const successConnect = async () => ({
  execute_kw: async () => 42,
});

describe("MinioUploadService", () => {
  it("rejects an empty filename before touching any dependency", async () => {
    const { service, emitted } = makeService(successConnect);
    await expect(
      service.generateUploadUrl(7, { filename: "   " } as UploadDto)
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(emitted).toHaveLength(0);
  });

  it("builds the object key, resolves the MIME type, and wires the Odoo id", async () => {
    const { service, emitted } = makeService(successConnect);
    const result = await service.generateUploadUrl(7, {
      filename: "render.glb",
      description: "Final exterior render",
    } as UploadDto);

    expect(result.uploadUrl).toBe("https://minio.local/uploads/signed");
    expect(result.key).toBe("/hexastudio/projects/7/deliverables/render.glb");
    expect(result.expiresIn).toBe(3600);
    expect(result.metadata.id).toBe(42);
    expect(result.metadata.mimetype).toBe("model/gltf-binary");
    expect(result.metadata.bucket).toBe("uploads");

    const events = emitted.map((e) => e.event);
    expect(events).toEqual(["project:uploading", "project:uploaded"]);
    expect(emitted[0].room).toBe("project:7");
  });

  it("still returns a valid presigned URL when Odoo is down (metadata id 0)", async () => {
    const { service } = makeService(async () => {
      throw new Error("odoo unreachable");
    });
    const result = await service.generateUploadUrl(7, {
      filename: "notes.txt",
    } as UploadDto);

    expect(result.uploadUrl).toBe("https://minio.local/uploads/signed");
    expect(result.metadata.id).toBe(0);
    expect(result.metadata.mimetype).toBe("text/plain");
  });
});
