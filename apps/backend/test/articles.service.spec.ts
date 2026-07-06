import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ArticlesService } from '../src/modules/articles/articles.service';
import { NotFoundException } from '@nestjs/common';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let httpService: HttpService;

  const mockArticle = {
    id: 1,
    title: 'Test Article',
    slug: 'test-article',
    excerpt: 'Article excerpt',
    content: [],
    coverImage: null,
    category: { id: 1, name: 'News', slug: 'news' },
    author: 'Test Author',
    readTime: 5,
    tags: ['architecture'],
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: HttpService,
          useValue: { get: vi.fn() },
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('getAllArticles returns mapped articles', async () => {
    vi.mocked(httpService.get).mockReturnValueOnce(
      of({
        data: {
          data: [mockArticle],
          meta: { pagination: { total: 1 } },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }),
    );

    const result = await service.getAllArticles();
    expect(result.total).toBe(1);
    expect(result.articles[0].slug).toBe('test-article');
  });

  it('getArticleBySlug throws NotFoundException for missing slug', async () => {
    vi.mocked(httpService.get).mockReturnValueOnce(
      of({
        data: { data: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }),
    );

    await expect(service.getArticleBySlug('nonexistent')).rejects.toThrow(NotFoundException);
  });
});
