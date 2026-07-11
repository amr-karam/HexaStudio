import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { of, throwError } from 'rxjs';
import { AuthService } from '../src/modules/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

const httpResponse = (data: unknown) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

describe('AuthService', () => {
  let service: AuthService;
  let httpService: HttpService;
  let jwtService: JwtService;

  const cmsUser = {
    id: 7,
    email: 'user@example.com',
    username: 'user',
    role: { type: 'authenticated' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: HttpService,
          useValue: { post: vi.fn(), get: vi.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: vi.fn().mockReturnValue('signed-jwt-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    httpService = module.get<HttpService>(HttpService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('register returns a jwt and mapped user', async () => {
    vi.mocked(httpService.post).mockReturnValueOnce(of(httpResponse({ user: cmsUser })));

    const result = await service.register('user@example.com', 'user', 'password123');

    expect(result.jwt).toBe('signed-jwt-token');
    expect(result.user).toEqual({
      id: '7',
      email: 'user@example.com',
      username: 'user',
      role: 'user',
    });
    expect(httpService.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/local/register'),
      { email: 'user@example.com', username: 'user', password: 'password123' },
    );
  });

  it('login returns a jwt and maps admin role', async () => {
    vi.mocked(httpService.post).mockReturnValueOnce(
      of(httpResponse({ user: { ...cmsUser, role: { type: 'admin' } } })),
    );

    const result = await service.login('user@example.com', 'password123');

    expect(result.jwt).toBe('signed-jwt-token');
    expect(result.user.role).toBe('admin');
    expect(httpService.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/local'),
      { identifier: 'user@example.com', password: 'password123' },
    );
  });

  it('validateToken returns the mapped user on success', async () => {
    vi.mocked(httpService.get).mockReturnValueOnce(of(httpResponse(cmsUser)));

    const user = await service.validateToken('a-token');

    expect(user.id).toBe('7');
    expect(user.email).toBe('user@example.com');
    expect(httpService.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/me'),
      { headers: { Authorization: 'Bearer a-token' } },
    );
  });

  it('validateToken throws UnauthorizedException when the request fails', async () => {
    vi.mocked(httpService.get).mockReturnValueOnce(throwError(() => new Error('boom')));

    await expect(service.validateToken('bad-token')).rejects.toThrow(UnauthorizedException);
  });

  it('refreshToken issues a new jwt for the user', async () => {
    vi.mocked(httpService.get).mockReturnValueOnce(of(httpResponse(cmsUser)));

    const result = await service.refreshToken('7');

    expect(result.jwt).toBe('signed-jwt-token');
    expect(result.user.id).toBe('7');
    expect(jwtService.sign).toHaveBeenCalled();
  });
});
