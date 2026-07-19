import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OdooDocumentService } from '../src/modules/odoo/odoo-document.service';
import { MinioService } from '../src/modules/storage/minio.service';
import { RedisService } from '../src/modules/storage/redis.service';

describe('OdooDocumentService', () => {
  let service: OdooDocumentService;
  let minioService: jest.Mocked<Pick<MinioService, 'uploadFile' | 'getPresignedDownloadUrl' | 'deleteFile'>>;
  let redisService: jest.Mocked<Pick<RedisService, 'hset' | 'hgetall' | 'hdel'>>;

  const mockFile = {
    buffer: Buffer.from('fake-file-content'),
    originalname: 'report.pdf',
    mimetype: 'application/pdf',
    size: 4096,
  };

  const mockProjectId = 7;

  beforeEach(async () => {
    minioService = {
      uploadFile: vi.fn(),
      getPresignedDownloadUrl: vi.fn(),
      deleteFile: vi.fn(),
    };

    redisService = {
      hset: vi.fn(),
      hgetall: vi.fn(),
      hdel: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OdooDocumentService,
        { provide: MinioService, useValue: minioService },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get<OdooDocumentService>(OdooDocumentService);
  });

  describe('uploadAndLink', () => {
    it('uploads buffer to MinIO and stores metadata in Redis', async () => {
      minioService.uploadFile.mockResolvedValueOnce(undefined);
      redisService.hset.mockResolvedValueOnce(undefined);

      const result = await service.uploadAndLink(mockFile, mockProjectId);

      expect(minioService.uploadFile).toHaveBeenCalledTimes(1);
      expect(minioService.uploadFile).toHaveBeenCalledWith(
        'portal',
        expect.stringMatching(/^odoo-documents\/project-7\/\d+-report\.pdf$/),
        mockFile.buffer,
        { 'Content-Type': 'application/pdf' },
      );

      expect(redisService.hset).toHaveBeenCalledTimes(2);
      expect(result).toMatchObject({
        name: 'report.pdf',
        mimeType: 'application/pdf',
        fileSize: 4096,
        projectId: 7,
      });
      expect(result.filePath).toMatch(/^odoo-documents\/project-7\/\d+-report\.pdf$/);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('sanitizes unsafe characters from the original filename', async () => {
      const unsafeFile = {
        buffer: Buffer.from('data'),
        originalname: 'my <report> (final).pdf',
        mimetype: 'application/pdf',
        size: 100,
      };

      minioService.uploadFile.mockResolvedValueOnce(undefined);
      redisService.hset.mockResolvedValueOnce(undefined);

      await service.uploadAndLink(unsafeFile, mockProjectId);

      const uploadArg = minioService.uploadFile.mock.calls[0][1] as string;
      expect(uploadArg).toMatch(/^odoo-documents\/project-7\/\d+-my__report___final_\.pdf$/);
    });
  });

  describe('getProjectDocuments', () => {
    const docs = {
      'doc-1': {
        id: 'doc-1',
        name: 'contract.pdf',
        mimeType: 'application/pdf',
        fileSize: 2048,
        filePath: 'odoo-documents/project-7/1700000000-contract.pdf',
        projectId: 7,
        uploadedBy: 'user@example.com',
        uploadedAt: '2026-07-17T12:00:00.000Z',
        originalName: 'contract.pdf',
        storagePath: 'odoo-documents/project-7/1700000000-contract.pdf',
      },
      'doc-2': {
        id: 'doc-2',
        name: 'blueprint.dwg',
        mimeType: 'application/dwg',
        fileSize: 65536,
        filePath: 'odoo-documents/project-7/1700000001-blueprint.dwg',
        projectId: 7,
        uploadedBy: 'user@example.com',
        uploadedAt: '2026-07-18T08:30:00.000Z',
        originalName: 'blueprint.dwg',
        storagePath: 'odoo-documents/project-7/1700000001-blueprint.dwg',
      },
    };

    it('lists project documents with signed URLs', async () => {
      redisService.hgetall.mockResolvedValueOnce(docs);
      minioService.getPresignedDownloadUrl
        .mockResolvedValueOnce('https://minio.example.com/doc1.pdf?token=abc')
        .mockResolvedValueOnce('https://minio.example.com/doc2.dwg?token=xyz');

      const results = await service.getProjectDocuments(mockProjectId);

      expect(redisService.hgetall).toHaveBeenCalledWith('portal:documents:7');
      expect(minioService.getPresignedDownloadUrl).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(2);
      expect(results[0].downloadUrl).toBe('https://minio.example.com/doc1.pdf?token=abc');
      expect(results[1].downloadUrl).toBe('https://minio.example.com/doc2.dwg?token=xyz');
    });

    it('returns empty array when no documents exist', async () => {
      redisService.hgetall.mockResolvedValueOnce({});

      const results = await service.getProjectDocuments(mockProjectId);

      expect(results).toEqual([]);
      expect(minioService.getPresignedDownloadUrl).not.toHaveBeenCalled();
    });

    it('survives a MinIO error for one document and continues', async () => {
      redisService.hgetall.mockResolvedValueOnce(docs);
      minioService.getPresignedDownloadUrl
        .mockResolvedValueOnce('https://minio.example.com/doc1.pdf?token=ok')
        .mockRejectedValueOnce(new Error('MinIO timeout'));

      const results = await service.getProjectDocuments(mockProjectId);

      expect(results[0].downloadUrl).toBe('https://minio.example.com/doc1.pdf?token=ok');
      expect(results[1].downloadUrl).toBe('');
    });
  });

  describe('getSignedUrl', () => {
    it('returns a presigned URL for a valid document ID', async () => {
      redisService.hgetall
        .mockResolvedValueOnce({ 'doc-1': '7' })
        .mockResolvedValueOnce({
          'doc-1': {
            id: 'doc-1',
            filePath: 'odoo-documents/project-7/1700000100-doc.pdf',
          },
        });
      minioService.getPresignedDownloadUrl.mockResolvedValueOnce(
        'https://minio.example.com/doc.pdf?token=signed',
      );

      const url = await service.getSignedUrl('doc-1');

      expect(redisService.hgetall).toHaveBeenCalledWith('portal:documents:index');
      expect(minioService.getPresignedDownloadUrl).toHaveBeenCalledWith(
        'portal',
        'odoo-documents/project-7/1700000100-doc.pdf',
        3600,
      );
      expect(url).toBe('https://minio.example.com/doc.pdf?token=signed');
    });

    it('throws NotFoundException when document is not found', async () => {
      redisService.hgetall.mockResolvedValueOnce({});

      await expect(service.getSignedUrl('missing')).rejects.toThrow(NotFoundException);
      expect(minioService.getPresignedDownloadUrl).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when file path is missing', async () => {
      redisService.hgetall
        .mockResolvedValueOnce({ 'doc-1': '7' })
        .mockResolvedValueOnce({
          'doc-1': {
            id: 'doc-1',
            filePath: '',
          },
        });

      await expect(service.getSignedUrl('doc-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteDocument', () => {
    it('deletes file from MinIO and metadata from Redis', async () => {
      redisService.hgetall.mockResolvedValueOnce({
        'doc-1': {
          id: 'doc-1',
          filePath: 'odoo-documents/project-7/doc.pdf',
          storagePath: 'odoo-documents/project-7/doc.pdf',
        },
      });
      minioService.deleteFile.mockResolvedValueOnce(undefined);
      redisService.hdel.mockResolvedValueOnce(undefined);

      await service.deleteDocument(mockProjectId, 'doc-1');

      expect(minioService.deleteFile).toHaveBeenCalledWith('portal', 'odoo-documents/project-7/doc.pdf');
      expect(redisService.hdel).toHaveBeenCalledWith('portal:documents:7', 'doc-1');
      expect(redisService.hdel).toHaveBeenCalledWith('portal:documents:index', 'doc-1');
    });

    it('throws NotFoundException when document does not exist', async () => {
      redisService.hgetall.mockResolvedValueOnce({});

      await expect(service.deleteDocument(mockProjectId, 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
