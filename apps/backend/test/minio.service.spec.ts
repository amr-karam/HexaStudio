import './setup';
import { MinioService } from '../src/modules/storage/minio.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('MinioService', () => {
  let service: MinioService;
  let client: {
    presignedGetObject: ReturnType<typeof vi.fn>;
    presignedPutObject: ReturnType<typeof vi.fn>;
    putObject: ReturnType<typeof vi.fn>;
    removeObject: ReturnType<typeof vi.fn>;
    listObjects: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = new MinioService();
    client = {
      presignedGetObject: vi.fn().mockResolvedValue('https://minio/download-url'),
      presignedPutObject: vi.fn().mockResolvedValue('https://minio/upload-url'),
      putObject: vi.fn().mockResolvedValue(undefined),
      removeObject: vi.fn().mockResolvedValue(undefined),
      listObjects: vi.fn(),
    };
    // Inject the mocked client in place of the real MinIO connection.
    (service as unknown as { client: typeof client }).client = client;
  });

  describe('validation', () => {
    it('rejects buckets that are not allowlisted', async () => {
      await expect(service.getPresignedDownloadUrl('secret', 'a.png')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('rejects object paths that attempt traversal', async () => {
      await expect(service.getPresignedDownloadUrl('uploads', '../etc/passwd')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.getPresignedDownloadUrl('uploads', '/abs/path')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.getPresignedDownloadUrl('uploads', 'a//b')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getPresignedDownloadUrl', () => {
    it('returns a url and clamps the expiry to the maximum', async () => {
      const url = await service.getPresignedDownloadUrl('uploads', 'a.png', 999999);
      expect(url).toBe('https://minio/download-url');
      expect(client.presignedGetObject).toHaveBeenCalledWith('uploads', 'a.png', 86400);
    });

    it('clamps the expiry to the minimum', async () => {
      await service.getPresignedDownloadUrl('uploads', 'a.png', 1);
      expect(client.presignedGetObject).toHaveBeenCalledWith('uploads', 'a.png', 60);
    });
  });

  describe('getPresignedUploadUrl', () => {
    it('returns an upload url', async () => {
      const url = await service.getPresignedUploadUrl('models', 'chair.glb');
      expect(url).toBe('https://minio/upload-url');
      expect(client.presignedPutObject).toHaveBeenCalledWith('models', 'chair.glb', 3600);
    });
  });

  describe('uploadFile', () => {
    it('uploads a buffer and returns the object name', async () => {
      const buffer = Buffer.from('data');
      const result = await service.uploadFile('uploads', 'file.txt', buffer, { owner: 'me' });
      expect(result).toBe('file.txt');
      expect(client.putObject).toHaveBeenCalledWith('uploads', 'file.txt', buffer, undefined, {
        owner: 'me',
      });
    });
  });

  describe('deleteFile', () => {
    it('removes the object', async () => {
      await service.deleteFile('uploads', 'file.txt');
      expect(client.removeObject).toHaveBeenCalledWith('uploads', 'file.txt');
    });
  });

  describe('listFiles', () => {
    it('collects object names from the stream', async () => {
      client.listObjects.mockReturnValue(
        (async function* () {
          yield { name: 'a.png' };
          yield { name: undefined };
          yield { name: 'b.png' };
        })(),
      );

      const files = await service.listFiles('uploads', 'prefix');
      expect(files).toEqual(['a.png', 'b.png']);
      expect(client.listObjects).toHaveBeenCalledWith('uploads', 'prefix', true);
    });
  });
});
