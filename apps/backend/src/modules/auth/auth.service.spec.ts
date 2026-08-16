import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RedisService } from '../storage/redis.service';
import { UsersService } from '../users/users.service';

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  sadd: vi.fn(),
  smembers: vi.fn(),
  srem: vi.fn(),
  expire: vi.fn(),
};

const mockJwt = {
  sign: vi.fn(() => 'signed-token'),
  decode: vi.fn(),
};

const mockHttp = {
  post: vi.fn(),
  get: vi.fn(),
};

const mockUsers = {
  findByEmail: vi.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: HttpService, useValue: mockHttp },
        { provide: JwtService, useValue: mockJwt },
        { provide: RedisService, useValue: mockRedis },
        { provide: UsersService, useValue: mockUsers },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('logout', () => {
    it('revokes the stored refresh token and its family when a refresh token is provided', async () => {
      mockRedis.get.mockResolvedValueOnce({ userId: 'u1', familyId: 'fam-1' });

      await service.logout('access-token', 'refresh-token');

      expect(mockRedis.srem).toHaveBeenCalledWith('user_tokens:u1', 'fam-1');
      expect(mockRedis.del).toHaveBeenCalledWith('refresh_token_family:fam-1');
      expect(mockRedis.del).toHaveBeenCalledWith('refresh_token:refresh-token');
    });

    it('blacklists the access token jti when an access token is provided', async () => {
      mockJwt.decode.mockReturnValueOnce({
        jti: 'jti-1',
        exp: Math.floor(Date.now() / 1000) + 900,
      });

      await service.logout('access-token');

      expect(mockRedis.set).toHaveBeenCalledWith('blacklist:jti-1', true, expect.any(Number));
    });

    it('still deletes a legacy refresh token that has no family record', async () => {
      mockRedis.get.mockResolvedValueOnce({ userId: 'u1' });

      await service.logout('access-token', 'refresh-token');

      expect(mockRedis.del).toHaveBeenCalledWith('refresh_token:refresh-token');
      expect(mockRedis.srem).not.toHaveBeenCalled();
    });

    it('does not fail when the refresh token is unknown', async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      await expect(service.logout('access-token', 'missing-token')).resolves.toBeUndefined();
      expect(mockRedis.del).toHaveBeenCalledWith('refresh_token:missing-token');
    });
  });
});