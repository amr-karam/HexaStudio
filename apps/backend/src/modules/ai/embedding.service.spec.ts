process.env.JWT_SECRET ??= 'test-jwt-secret-that-is-at-least-32-chars-long-for-testing';
process.env.CMS_URL ??= 'http://test-cms:1337';
process.env.REDIS_PASSWORD ??= 'test-redis-password';
process.env.MINIO_ROOT_USER ??= 'test-minio-user';
process.env.MINIO_ROOT_PASSWORD ??= 'test-minio-password-at-least-8';
process.env.ODOO_HOST ??= 'odoo';
process.env.ODOO_DB ??= 'test_db';
process.env.ODOO_USER ??= 'test_user';
process.env.ODOO_PASSWORD ??= 'test_password';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmbeddingService } from './embedding.service';
import { VectorService } from '../vector/vector.service';

vi.mock('openai', () => ({
  default: class {
    embeddings = {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.05) }],
      }),
    };
  },
}));

const mockConfigService = {
  get: vi.fn((key: string) => {
    const env: Record<string, string> = {
      VECTOR_HOST: 'localhost',
      VECTOR_PORT: '6333',
      VECTOR_API_KEY: 'test-key',
    };
    return env[key];
  }),
};

describe('EmbeddingService', () => {
  let service: EmbeddingService;

  const mockVectorService = {
    upsert: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingService,
        { provide: VectorService, useValue: mockVectorService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EmbeddingService>(EmbeddingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateEmbedding', () => {
    it('should return an array of numbers', async () => {
      const vector = await service.generateEmbedding('test text');
      expect(Array.isArray(vector)).toBe(true);
      expect(vector.length).toBe(1536);
      expect(vector.every((v) => typeof v === 'number')).toBe(true);
    });
  });
});
