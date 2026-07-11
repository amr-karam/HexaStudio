import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { HealthModule } from '../src/modules/health/health.module';
import { OdooService } from '../src/modules/odoo/odoo.service';
import { RedisService } from '../src/modules/storage/redis.service';

const mockRedisService = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
  flush: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
};

const mockOdooService = {
  authenticate: vi.fn().mockResolvedValue(1),
  getCircuitState: vi.fn().mockReturnValue('CLOSED'),
  searchRead: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockResolvedValue(1),
  write: vi.fn().mockResolvedValue(true),
  execute: vi.fn().mockResolvedValue({}),
};

describe('HealthModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule],
    })
      .overrideProvider(RedisService)
      .useValue(mockRedisService)
      .overrideProvider(OdooService)
      .useValue(mockOdooService)
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
