import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { HealthController } from '../src/modules/health/health.controller';
import { OdooService } from '../src/modules/odoo/odoo.service';
import { RedisService } from '../src/modules/storage/redis.service';
import { AiChatService } from '../src/modules/ai/ai-chat.service';
import { EventBus } from '../src/modules/realtime/event-bus.service';
import { RedisModule } from '../src/modules/storage/redis.module';

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

const mockAiChatService = {
  isAvailable: true,
  provider: 'openai' as const,
  model: 'gpt-4o-mini',
  fastModel: undefined,
  chatBaseUrl: 'https://api.openai.com/v1',
};

const mockEventBus = {
  emit: vi.fn(),
  on: vi.fn(),
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
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        RedisModule,
      ],
      controllers: [HealthController],
      providers: [
        { provide: OdooService, useValue: mockOdooService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: AiChatService, useValue: mockAiChatService },
        { provide: EventBus, useValue: mockEventBus },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  }, 30000);

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
    expect(res.body.llm).toBeDefined();
    expect(res.body.llm.available).toBe(true);
    expect(res.body.llm.provider).toBe('openai');
    expect(res.body.llm.model).toBe('gpt-4o-mini');
  });
});