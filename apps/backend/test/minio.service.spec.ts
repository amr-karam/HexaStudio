import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import './setup';
import { InternalServerErrorException } from '@nestjs/common';
import { MinioService } from '../src/modules/storage/minio.service';

function createMockClient() {
  return {
    presignedGetObject: vi.fn(),
    presignedPutObject: vi.fn(),
    putObject: vi.fn(),
    removeObject: vi.fn(),
    listObjects: vi.fn(),
  };
}

describe('MinioService (injected mock client)', () => {
  let service: MinioService;
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new MinioService(mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validateBucket (via getPresignedDownloadUrl)', () => {
    it('throws InternalServerErrorException for disallowed bucket', async () => {
      await expect(service.getPresignedDownloadUrl('malicious', 'file.txt')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws for bucket not in the allowed list', async () => {
      await expect(service.getPresignedDownloadUrl('../../../../etc', 'file.txt')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('accepts all allowed buckets', async () => {
      const buckets = ['uploads', 'models', 'textures', 'videos', 'hdr', 'backups'];
      for (const bucket of buckets) {
        mockClient.presignedGetObject.mockResolvedValueOnce(`https://url/${bucket}`);
        const url = await service.getPresignedDownloadUrl(bucket, 'file.txt');
        expect(url).toContain(bucket);
      }
    });
  });

  describe('validatePath (via getPresignedDownloadUrl)', () => {
    it('throws for path traversal (..)', async () => {
      await expect(service.getPresignedDownloadUrl('uploads', '../etc/passwd')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws for double slash (//)', async () => {
      await expect(service.getPresignedDownloadUrl('uploads', 'foo//bar')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws for absolute path (/)', async () => {
      await expect(service.getPresignedDownloadUrl('uploads', '/root/secret')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getPresignedDownloadUrl', () => {
    it('returns presigned URL for valid inputs', async () => {
      mockClient.presignedGetObject.mockResolvedValueOnce('https://download-url');
      const url = await service.getPresignedDownloadUrl('models', 'scene.glb', 1800);
      expect(url).toBe('https://download-url');
      expect(mockClient.presignedGetObject).toHaveBeenCalledWith('models', 'scene.glb', 1800);
    });

    it('clamps expiry to max 86400', async () => {
      mockClient.presignedGetObject.mockResolvedValueOnce('https://url');
      await service.getPresignedDownloadUrl('uploads', 'file.txt', 999999);
      expect(mockClient.presignedGetObject).toHaveBeenCalledWith('uploads', 'file.txt', 86400);
    });

    it('clamps expiry to min 60', async () => {
      mockClient.presignedGetObject.mockResolvedValueOnce('https://url');
      await service.getPresignedDownloadUrl('uploads', 'file.txt', 5);
      expect(mockClient.presignedGetObject).toHaveBeenCalledWith('uploads', 'file.txt', 60);
    });

    it('uses default expiry of 3600', async () => {
      mockClient.presignedGetObject.mockResolvedValueOnce('https://url');
      await service.getPresignedDownloadUrl('uploads', 'file.txt');
      expect(mockClient.presignedGetObject).toHaveBeenCalledWith('uploads', 'file.txt', 3600);
    });
  });

  describe('uploadFile', () => {
    it('uploads buffer and returns object name', async () => {
      mockClient.putObject.mockResolvedValueOnce(undefined);
      const result = await service.uploadFile('uploads', 'test.jpg', Buffer.from('data'));
      expect(result).toBe('test.jpg');
      // Service auto-detects Content-Type from .jpg extension
      expect(mockClient.putObject).toHaveBeenCalledWith(
        'uploads', 'test.jpg', expect.any(Buffer), undefined, { 'Content-Type': 'image/jpeg' },
      );
    });

    it('uploads with metadata', async () => {
      mockClient.putObject.mockResolvedValueOnce(undefined);
      const metadata = { 'content-type': 'image/jpeg' };
      await service.uploadFile('uploads', 'photo.jpg', Buffer.from('img'), metadata);
      expect(mockClient.putObject).toHaveBeenCalledWith(
        'uploads', 'photo.jpg', expect.any(Buffer), undefined, metadata,
      );
    });
  });

  describe('deleteFile', () => {
    it('calls removeObject for valid bucket and path', async () => {
      mockClient.removeObject.mockResolvedValueOnce(undefined);
      await service.deleteFile('uploads', 'old-file.jpg');
      expect(mockClient.removeObject).toHaveBeenCalledWith('uploads', 'old-file.jpg');
    });
  });

  describe('listFiles', () => {
    it('returns list of object names, filtering out entries with no name', async () => {
      const asyncIterable = (async function* () {
        yield { name: 'file1.glb' };
        yield { name: 'file2.glb' };
        yield {};
      })();
      mockClient.listObjects.mockReturnValueOnce(asyncIterable);

      const files = await service.listFiles('models', 'scenes/');
      expect(files).toHaveLength(2);
      expect(files[0].name).toBe('file1.glb');
      expect(files[1].name).toBe('file2.glb');
    });

    it('returns empty array when no objects in bucket', async () => {
      const emptyIterable = (async function* () {})();
      mockClient.listObjects.mockReturnValueOnce(emptyIterable);

      const files = await service.listFiles('uploads');
      expect(files).toEqual([]);
    });
  });
});
