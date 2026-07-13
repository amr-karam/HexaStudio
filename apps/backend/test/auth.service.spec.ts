import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AuthService } from '../src/modules/auth/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpService: HttpService;
  let jwtService: JwtService;

  const mockCmsUser = {
    id: 1,
    email: 'user@example.com',
    username: 'testuser',
    role: { type: 'authenticated' },
  };

  const mockAdminUser = {
    id: 2,
    email: 'admin@hexastudio.net',
    username: 'admin',
    role: { type: 'admin' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: HttpService,
          useValue: {
            post: vi.fn(),
            get: vi.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    httpService = module.get<HttpService>(HttpService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('returns jwt and user on successful login', async () => {
      vi.mocked(httpService.post).mockReturnValueOnce(
        of({
          data: { user: mockCmsUser },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        }),
      );

      const result = await service.login('user@example.com', 'password123');

      expect(result.jwt).toBe('mock-jwt-token');
      expect(result.user.email).toBe('user@example.com');
      expect(result.user.role).toBe('user');
      expect(httpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/local'),
        expect.objectContaining({ identifier: 'user@example.com' }),
      );
    });

    it('maps admin role correctly', async () => {
      vi.mocked(httpService.post).mockReturnValueOnce(
        of({
          data: { user: mockAdminUser },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        }),
      );

      const result = await service.login('admin@hexastudio.net', 'secret');
      expect(result.user.role).toBe('admin');
    });
  });

  describe('register', () => {
    it('returns jwt and user on successful registration', async () => {
      vi.mocked(httpService.post).mockReturnValueOnce(
        of({
          data: { user: mockCmsUser },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        }),
      );

      const result = await service.register('user@example.com', 'testuser', 'password');

      expect(result.jwt).toBe('mock-jwt-token');
      expect(result.user.id).toBe('1');
      expect(result.user.username).toBe('testuser');
      expect(httpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/local/register'),
        expect.objectContaining({ email: 'user@example.com', username: 'testuser' }),
      );
    });
  });

  describe('validateToken', () => {
    it('returns user data for valid token', async () => {
      vi.mocked(httpService.get).mockReturnValueOnce(
        of({
          data: mockCmsUser,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        }),
      );

      const user = await service.validateToken('valid-token');
      expect(user.email).toBe('user@example.com');
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/me'),
        expect.objectContaining({ headers: { Authorization: 'Bearer valid-token' } }),
      );
    });

    it('throws UnauthorizedException for invalid token', async () => {
      vi.mocked(httpService.get).mockReturnValueOnce(
        throwError(() => new Error('Unauthorized')),
      );

      await expect(service.validateToken('bad-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('returns new jwt and user data', async () => {
      vi.mocked(httpService.get).mockReturnValueOnce(
        of({
          data: mockCmsUser,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        }),
      );

      const result = await service.refreshToken('1');
      expect(result.jwt).toBe('mock-jwt-token');
      expect(result.user.id).toBe('1');
      expect(jwtService.sign).toHaveBeenCalledTimes(2); // once for auth header, once for final token
    });
  });
});
