import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ServicesService } from '../src/modules/services/services.service';
import { NotFoundException } from '@nestjs/common';

describe('ServicesService', () => {
  let service: ServicesService;
  let httpService: HttpService;

  const mockService = {
    id: 1,
    title: 'Architecture Design',
    slug: 'architecture-design',
    description: 'Full-service architecture design',
    icon: 'building',
    features: ['Concept Design', 'Development', 'Construction Docs'],
    order: 1,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: HttpService,
          useValue: { get: vi.fn() },
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('getAllServices returns mapped services', async () => {
    vi.mocked(httpService.get).mockReturnValueOnce(
      of({
        data: {
          data: [mockService],
          meta: { pagination: { total: 1 } },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }),
    );

    const result = await service.getAllServices();
    expect(result.total).toBe(1);
    expect(result.services[0].slug).toBe('architecture-design');
  });

  it('getServiceBySlug throws NotFoundException for missing slug', async () => {
    vi.mocked(httpService.get).mockReturnValueOnce(
      of({
        data: { data: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }),
    );

    await expect(service.getServiceBySlug('nonexistent')).rejects.toThrow(NotFoundException);
  });
});
