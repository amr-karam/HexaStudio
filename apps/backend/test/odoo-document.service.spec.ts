import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OdooDocumentService } from '../src/modules/odoo/odoo-document.service';
import { OdooService } from '../src/modules/odoo/odoo.service';
import { MinioService } from '../src/modules/storage/minio.service';

describe('OdooDocumentService', () => {
  let service: OdooDocumentService;
  let odooService: jest.Mocked<Pick<OdooService, 'execute' | 'create'>>;
  let minioService: jest.Mocked<Pick<MinioService, 'uploadFile' | 'getPresignedDownloadUrl'>>;

  const mockFile = {
    buffer: Buffer.from('fake-file-content'),
    originalName: 'report.pdf',
    mimetype: 'application/pdf',
    size: 4096,
  };

  const mockProjectId = 7;

  beforeEach(async () => {
    odooService = {
      execute: vi.fn(),
      create: vi.fn(),
    };

    minioService = {
      uploadFile: vi.fn(),
      getPresignedDownloadUrl: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OdooDocumentService,
        { provide: OdooService, useValue: odooService },
        { provide: MinioService, useValue: minioService },
      ],
    }).compile();

    service = module.get<OdooDocumentService>(OdooDocumentService);
  });

  // ---------------------------------------------------------------------------
  // uploadAndLink
  // ---------------------------------------------------------------------------

  describe('uploadAndLink', () => {
    it('uploads buffer to MinIO, creates Odoo document record, returns metadata', async () => {
      const expectedDocId = 42;

      minioService.uploadFile.mockResolvedValueOnce(undefined);
      odooService.create.mockResolvedValueOnce(expectedDocId);

      const result = await service.uploadAndLink(mockFile, mockProjectId);

      // Verify MinIO upload was called with the correct arguments
      expect(minioService.uploadFile).toHaveBeenCalledTimes(1);
      expect(minioService.uploadFile).toHaveBeenCalledWith(
        'uploads',
        expect.stringMatching(/^odoo-documents\/project-7\/\d+-report\.pdf$/),
        mockFile.buffer,
        { 'Content-Type': 'application/pdf' },
      );

      // Verify Odoo create was called with the correct document values
      expect(odooService.create).toHaveBeenCalledTimes(1);
      expect(odooService.create).toHaveBeenCalledWith('documents.document', {
        name: 'report.pdf',
        x_hexa_minio_path: expect.stringMatching(/^odoo-documents\/project-7\/\d+-report\.pdf$/),
        x_hexa_minio_bucket: 'uploads',
        x_hexa_project_id: 7,
        x_hexa_file_size: 4096,
        x_hexa_mime_type: 'application/pdf',
      });

      // Verify returned metadata
      expect(result).toMatchObject({
        id: 42,
        name: 'report.pdf',
        mimeType: 'application/pdf',
        fileSize: 4096,
        projectId: 7,
      });
      expect(result.filePath).toMatch(/^odoo-documents\/project-7\/\d+-report\.pdf$/);
      expect(result.createdAt).toBeDefined();
    });

    it('when MinIO succeeds but Odoo create fails, returns partial info with id=0', async () => {
      minioService.uploadFile.mockResolvedValueOnce(undefined);
      odooService.create.mockRejectedValueOnce(new Error('Odoo is unreachable'));

      const result = await service.uploadAndLink(mockFile, mockProjectId);

      // MinIO upload should still have been called
      expect(minioService.uploadFile).toHaveBeenCalledTimes(1);

      // Odoo create was attempted but failed
      expect(odooService.create).toHaveBeenCalledTimes(1);

      // Partial result with id=0
      expect(result).toMatchObject({
        id: 0,
        name: 'report.pdf',
        mimeType: 'application/pdf',
        fileSize: 4096,
        projectId: 7,
      });
      expect(result.filePath).toMatch(/^odoo-documents\/project-7\/\d+-report\.pdf$/);
      expect(result.createdAt).toBeDefined();
    });

    it('sanitizes unsafe characters from the original filename', async () => {
      const unsafeFile = {
        buffer: Buffer.from('data'),
        originalName: 'my <report> (final).pdf',
        mimetype: 'application/pdf',
        size: 100,
      };

      minioService.uploadFile.mockResolvedValueOnce(undefined);
      odooService.create.mockResolvedValueOnce(99);

      await service.uploadAndLink(unsafeFile, mockProjectId);

      // The sanitized name should replace < > ( ) and spaces with underscores
      // "my <report> (final).pdf" → "my__report___final_.pdf"
      const uploadArg = minioService.uploadFile.mock.calls[0][1] as string;
      expect(uploadArg).toMatch(/^odoo-documents\/project-7\/\d+-my__report___final_\.pdf$/);

      const createArg = odooService.create.mock.calls[0][1] as Record<string, unknown>;
      expect(createArg.x_hexa_minio_path).toBe(uploadArg);
      expect(createArg.name).toBe('my <report> (final).pdf');
    });
  });

  // ---------------------------------------------------------------------------
  // getProjectDocuments
  // ---------------------------------------------------------------------------

  describe('getProjectDocuments', () => {
    const odooDocs = [
      {
        id: 1,
        name: 'contract.pdf',
        x_hexa_minio_path: 'odoo-documents/project-7/1700000000-contract.pdf',
        x_hexa_minio_bucket: 'uploads',
        x_hexa_file_size: 2048,
        x_hexa_mime_type: 'application/pdf',
        create_date: '2026-07-17 12:00:00',
      },
      {
        id: 2,
        name: 'blueprint.dwg',
        x_hexa_minio_path: 'odoo-documents/project-7/1700000001-blueprint.dwg',
        x_hexa_minio_bucket: 'uploads',
        x_hexa_file_size: 65536,
        x_hexa_mime_type: 'application/dwg',
        create_date: '2026-07-18 08:30:00',
      },
    ];

    it('calls odoo search_read and generates signed URLs for each document', async () => {
      odooService.execute.mockResolvedValueOnce(odooDocs);
      minioService.getPresignedDownloadUrl
        .mockResolvedValueOnce('https://minio.example.com/doc1.pdf?token=abc')
        .mockResolvedValueOnce('https://minio.example.com/doc2.dwg?token=xyz');

      const results = await service.getProjectDocuments(mockProjectId);

      // Odoo should be called with correct search_read arguments
      expect(odooService.execute).toHaveBeenCalledWith(
        'documents.document',
        'search_read',
        [
          [['x_hexa_project_id', '=', 7]],
          ['id', 'name', 'x_hexa_minio_path', 'x_hexa_minio_bucket', 'x_hexa_file_size', 'x_hexa_mime_type', 'create_date'],
          0, 100,
          'create_date desc',
        ],
      );

      // MinIO presigned URL should be requested for each document
      expect(minioService.getPresignedDownloadUrl).toHaveBeenCalledTimes(2);
      expect(minioService.getPresignedDownloadUrl).toHaveBeenCalledWith(
        'uploads',
        'odoo-documents/project-7/1700000000-contract.pdf',
        3600,
      );
      expect(minioService.getPresignedDownloadUrl).toHaveBeenCalledWith(
        'uploads',
        'odoo-documents/project-7/1700000001-blueprint.dwg',
        3600,
      );

      // Results should contain full metadata plus downloadUrl
      expect(results).toHaveLength(2);
      expect(results[0]).toMatchObject({
        id: 1,
        name: 'contract.pdf',
        mimeType: 'application/pdf',
        fileSize: 2048,
        filePath: 'odoo-documents/project-7/1700000000-contract.pdf',
        projectId: 7,
        createdAt: '2026-07-17 12:00:00',
        downloadUrl: 'https://minio.example.com/doc1.pdf?token=abc',
      });
      expect(results[1]).toMatchObject({
        id: 2,
        name: 'blueprint.dwg',
        downloadUrl: 'https://minio.example.com/doc2.dwg?token=xyz',
      });
    });

    it('handles missing file path gracefully (empty URL)', async () => {
      const docsWithMissingPath = [
        {
          id: 3,
          name: 'readme.txt',
          x_hexa_minio_path: '',
          x_hexa_minio_bucket: 'uploads',
          x_hexa_file_size: 512,
          x_hexa_mime_type: 'text/plain',
          create_date: '2026-07-18 10:00:00',
        },
      ];

      odooService.execute.mockResolvedValueOnce(docsWithMissingPath);

      const results = await service.getProjectDocuments(mockProjectId);

      // MinIO should NOT be called for empty paths
      expect(minioService.getPresignedDownloadUrl).not.toHaveBeenCalled();

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        id: 3,
        name: 'readme.txt',
        filePath: '',
        downloadUrl: '',
      });
    });

    it('handles missing bucket gracefully by defaulting to "uploads"', async () => {
      const docsWithMissingBucket = [
        {
          id: 4,
          name: 'notes.md',
          x_hexa_minio_path: 'odoo-documents/project-7/notes.md',
          x_hexa_minio_bucket: '',
          x_hexa_file_size: 256,
          x_hexa_mime_type: 'text/markdown',
          create_date: '2026-07-18 11:00:00',
        },
      ];

      odooService.execute.mockResolvedValueOnce(docsWithMissingBucket);
      minioService.getPresignedDownloadUrl.mockResolvedValueOnce('https://minio.example.com/notes.md?token=def');

      await service.getProjectDocuments(mockProjectId);

      // Should default to 'uploads' when bucket is empty
      expect(minioService.getPresignedDownloadUrl).toHaveBeenCalledWith(
        'uploads',
        'odoo-documents/project-7/notes.md',
        3600,
      );
    });

    it('survives a MinIO error for one document and continues processing others', async () => {
      const docs = [
        {
          id: 5,
          name: 'good.pdf',
          x_hexa_minio_path: 'odoo-documents/project-7/good.pdf',
          x_hexa_minio_bucket: 'uploads',
          x_hexa_file_size: 100,
          x_hexa_mime_type: 'application/pdf',
          create_date: '2026-07-18 12:00:00',
        },
        {
          id: 6,
          name: 'broken.dxf',
          x_hexa_minio_path: 'odoo-documents/project-7/broken.dxf',
          x_hexa_minio_bucket: 'uploads',
          x_hexa_file_size: 200,
          x_hexa_mime_type: 'application/dxf',
          create_date: '2026-07-18 13:00:00',
        },
      ];

      odooService.execute.mockResolvedValueOnce(docs);
      minioService.getPresignedDownloadUrl
        .mockResolvedValueOnce('https://minio.example.com/good.pdf?token=ok')
        .mockRejectedValueOnce(new Error('MinIO timeout'));

      const results = await service.getProjectDocuments(mockProjectId);

      expect(results).toHaveLength(2);
      // First document got its URL
      expect(results[0].downloadUrl).toBe('https://minio.example.com/good.pdf?token=ok');
      // Second document gets empty URL because MinIO failed
      expect(results[1].downloadUrl).toBe('');
    });

    it('returns empty array when odoo returns no documents', async () => {
      odooService.execute.mockResolvedValueOnce([]);

      const results = await service.getProjectDocuments(mockProjectId);

      expect(results).toEqual([]);
      expect(minioService.getPresignedDownloadUrl).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getSignedUrl
  // ---------------------------------------------------------------------------

  describe('getSignedUrl', () => {
    const documentId = 100;

    it('returns a presigned URL for a valid document ID', async () => {
      const odooResult = [
        {
          id: documentId,
          x_hexa_minio_path: 'odoo-documents/project-7/1700000100-doc.pdf',
          x_hexa_minio_bucket: 'uploads',
        },
      ];

      odooService.execute.mockResolvedValueOnce(odooResult);
      minioService.getPresignedDownloadUrl.mockResolvedValueOnce(
        'https://minio.example.com/doc.pdf?token=signed',
      );

      const url = await service.getSignedUrl(documentId);

      expect(odooService.execute).toHaveBeenCalledWith(
        'documents.document',
        'search_read',
        [
          [['id', '=', documentId]],
          ['x_hexa_minio_path', 'x_hexa_minio_bucket'],
        ],
      );
      expect(minioService.getPresignedDownloadUrl).toHaveBeenCalledWith(
        'uploads',
        'odoo-documents/project-7/1700000100-doc.pdf',
        3600,
      );
      expect(url).toBe('https://minio.example.com/doc.pdf?token=signed');
    });

    it('throws NotFoundException when document is not found', async () => {
      odooService.execute.mockResolvedValue([]);

      const promise = service.getSignedUrl(documentId);

      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow(
        `Document #${documentId} not found`,
      );
      expect(minioService.getPresignedDownloadUrl).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when file path is empty', async () => {
      const odooResult = [
        {
          id: documentId,
          x_hexa_minio_path: '',
          x_hexa_minio_bucket: 'uploads',
        },
      ];

      odooService.execute.mockResolvedValue(odooResult);

      const promise = service.getSignedUrl(documentId);

      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow(
        `No file path for document #${documentId}`,
      );
      expect(minioService.getPresignedDownloadUrl).not.toHaveBeenCalled();
    });

    it('defaults to "uploads" bucket when bucket field is empty', async () => {
      const odooResult = [
        {
          id: documentId,
          x_hexa_minio_path: 'odoo-documents/project-7/doc.pdf',
          x_hexa_minio_bucket: '',
        },
      ];

      odooService.execute.mockResolvedValueOnce(odooResult);
      minioService.getPresignedDownloadUrl.mockResolvedValueOnce(
        'https://minio.example.com/doc.pdf?token=default-bucket',
      );

      const url = await service.getSignedUrl(documentId);

      expect(minioService.getPresignedDownloadUrl).toHaveBeenCalledWith(
        'uploads',
        'odoo-documents/project-7/doc.pdf',
        3600,
      );
      expect(url).toBe('https://minio.example.com/doc.pdf?token=default-bucket');
    });
  });
});
