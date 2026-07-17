import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { HealthModule } from '../src/modules/health/health.module';
import { OdooService } from '../src/modules/odoo/odoo.service';
import { OdooSyncService } from '../src/modules/odoo/odoo-sync.service';
import { OdooEventListener } from '../src/modules/odoo/odoo-event.listener';
import { OdooApiService } from '../src/modules/odoo/odoo-api.service';
import { OdooDocumentService } from '../src/modules/odoo/odoo-document.service';
import { RedisService } from '../src/modules/storage/redis.service';
import { VectorSyncService } from '../src/modules/vector/vector-sync.service';
import { VectorModule } from '../src/modules/vector/vector.module';
import { EventBus } from '../src/modules/realtime/event-bus.service';

const mockRedisService = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
  flush: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
};

const mockOdooService = {
  ping: vi.fn().mockResolvedValue(true),
  authenticate: vi.fn().mockResolvedValue(1),
  getCircuitState: vi.fn().mockReturnValue('CLOSED'),
  searchRead: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockResolvedValue(1),
  write: vi.fn().mockResolvedValue(true),
  execute: vi.fn().mockResolvedValue({}),
};

const mockVectorSyncService = {
  syncAllProjects: vi.fn().mockResolvedValue(undefined),
  syncProject: vi.fn().mockResolvedValue(undefined),
};

const mockOdooSyncService = {
  getState: vi.fn().mockReturnValue({ lastSync: 0, counts: {} }),
  handleWebhook: vi.fn().mockResolvedValue(undefined),
};

const mockEventBus = {
  emit: vi.fn(),
  on: vi.fn(),
};

const mockOdooEventListener = {
  onProject: vi.fn(),
};

const mockOdooApiService = {
  getDocument: vi.fn(),
  createDocument: vi.fn(),
};

const mockOdooDocumentService = {
  listDocuments: vi.fn(),
  uploadDocument: vi.fn(),
};

describe('HealthModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    process.env.OPENAI_MODEL = 'gpt-4o-mini';
    process.env.OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';
    process.env.VECTOR_HOST = 'localhost';
    process.env.VECTOR_PORT = '6333';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule, VectorModule],
      providers: [
        { provide: RedisService, useValue: mockRedisService },
        { provide: EventBus, useValue: mockEventBus },
      ],
    })
      .overrideProvider(OdooService)
      .useValue(mockOdooService)
      .overrideProvider(OdooSyncService)
      .useValue(mockOdooSyncService)
      .overrideProvider(OdooEventListener)
      .useValue(mockOdooEventListener)
      .overrideProvider(OdooApiService)
      .useValue(mockOdooApiService)
      .overrideProvider(OdooDocumentService)
      .useValue(mockOdooDocumentService)
      .overrideProvider(EventBus)
      .useValue(mockEventBus)
      .overrideProvider(VectorSyncService)
      .useValue(mockVectorSyncService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns ok status', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('hexastudio-api');
    expect(res.body.timestamp).toBeDefined();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});
