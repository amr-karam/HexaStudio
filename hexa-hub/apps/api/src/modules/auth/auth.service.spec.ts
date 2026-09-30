import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.enum';
import { RefreshToken } from './entities/refresh-token.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;

  const mockUser: User = {
    id: 'uuid-1',
    email: 'amr@hexastudio.net',
    password: 'hashed-password',
    fullName: 'Amr Mohamed',
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    twoFactorSecret: null,
    twoFactorEnabled: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  /**
   * Builds a fresh refresh-token record per test.
   *
   * `AuthService` mutates the record it loads (flipping `isUsed`/`isRevoked`),
   * so a single shared object would carry that mutation into every later test
   * and make unrelated cases fail with the wrong error.
   */
  const createMockRefreshToken = (
    overrides: Partial<RefreshToken> = {},
  ): RefreshToken =>
    ({
      id: 'rt-uuid-1',
      jti: 'jti-1',
      hashedToken: 'hashed-token',
      familyId: 'family-1',
      isUsed: false,
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userId: 'uuid-1',
      user: mockUser,
      createdAt: new Date('2026-01-01'),
      ...overrides,
    }) as RefreshToken;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          // Must match `@InjectRepository(RefreshToken)` in AuthService, which
          // resolves through TypeORM's generated repository token. A custom
          // string token would never be injected.
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
    // `resetAllMocks` (not `clearAllMocks`) so a queued `mockResolvedValueOnce`
    // from a previous test cannot leak into the next one. `bcrypt` is a
    // module-level automock shared across this whole file, so its queued values
    // outlive the per-test TestingModule rebuilt above.
    jest.resetAllMocks();
  });

  describe('login', () => {
    it('returns access_token, refresh_token, and sanitized user on valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('signed-jwt');

      const result = await service.login('amr@hexastudio.net', 'secret');

      if ('requiresTwoFactor' in result) throw new Error('Unexpected 2FA response');
      expect(result.access_token).toBe('signed-jwt');
      expect(result.refresh_token).toBeDefined();
      expect(typeof result.refresh_token).toBe('string');
      expect(result.refresh_token.length).toBeGreaterThan(0);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: mockUser.role,
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('throws on unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login('ghost@hexastudio.net', 'x')).rejects.toThrow(
        'Invalid credentials',
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('throws on password mismatch', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('amr@hexastudio.net', 'wrong')).rejects.toThrow(
        'Invalid credentials',
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('never leaks which factor failed (same message for both cases)', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const unknownEmail = service.login('ghost@hexastudio.net', 'x').catch((e: Error) => e.message);

      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const wrongPassword = service.login('amr@hexastudio.net', 'x').catch((e: Error) => e.message);

      const [msgA, msgB] = await Promise.all([unknownEmail, wrongPassword]);
      expect(msgA).toBe(msgB);
    });

    it('does not return refresh_token when 2FA is required', async () => {
      const userWith2FA = { ...mockUser, twoFactorEnabled: true, twoFactorSecret: 'secret123' };
      usersService.findByEmail.mockResolvedValue(userWith2FA);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('amr@hexastudio.net', 'secret');

      expect('requiresTwoFactor' in result).toBe(true);
      if ('requiresTwoFactor' in result) {
        expect(result.requiresTwoFactor).toBe(true);
        expect(result.userId).toBe(mockUser.id);
      }
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('hashes the password before persisting', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('bcrypt-hash');
      usersService.create.mockImplementation(async (data) => ({
        ...mockUser,
        ...data,
      } as User));

      await service.register({
        email: 'new@hexastudio.net',
        password: 'plaintext-pass',
        fullName: 'New User',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext-pass', 10);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'bcrypt-hash' }),
      );
      const persisted = usersService.create.mock.calls[0][0];
      expect(persisted.password).not.toBe('plaintext-pass');
    });
  });

  describe('refreshTokens', () => {
    it('returns new access and refresh tokens on valid refresh token', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-input');
      refreshTokenRepository.findOne.mockResolvedValue(createMockRefreshToken());
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('new-jwt');

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result.access_token).toBe('new-jwt');
      expect(result.refresh_token).toBeDefined();
      expect(typeof result.refresh_token).toBe('string');
      expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { hashedToken: 'hashed-input' },
        relations: ['user'],
      });
    });

    it('throws UnauthorizedException on invalid refresh token', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-input');
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('throws UnauthorizedException on revoked refresh token', async () => {
      const revokedToken = createMockRefreshToken({ isRevoked: true });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-input');
      refreshTokenRepository.findOne.mockResolvedValue(revokedToken);

      await expect(service.refreshTokens('revoked-token')).rejects.toThrow(
        'Refresh token has been revoked',
      );
    });

    it('throws UnauthorizedException on used refresh token and revokes family', async () => {
      const usedToken = createMockRefreshToken({ isUsed: true });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-input');
      refreshTokenRepository.findOne.mockResolvedValue(usedToken);

      await expect(service.refreshTokens('used-token')).rejects.toThrow(
        'Refresh token has already been used',
      );
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { familyId: 'family-1' },
        { isRevoked: true },
      );
    });

    it('throws UnauthorizedException on expired refresh token', async () => {
      const expiredToken = createMockRefreshToken({
        expiresAt: new Date(Date.now() - 1000),
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-input');
      refreshTokenRepository.findOne.mockResolvedValue(expiredToken);

      await expect(service.refreshTokens('expired-token')).rejects.toThrow(
        'Refresh token has expired',
      );
    });

    it('marks old token as used and creates new tokens', async () => {
      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce('hashed-input')
        .mockResolvedValueOnce('hashed-new-token');
      const validToken = createMockRefreshToken();
      refreshTokenRepository.findOne.mockResolvedValue(validToken);
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.sign
        .mockReturnValueOnce('new-jwt')
        .mockReturnValueOnce('new-refresh-jwt');

      const result = await service.refreshTokens('valid-refresh-token');

      expect(validToken.isUsed).toBe(true);
      expect(refreshTokenRepository.save).toHaveBeenCalledWith(validToken);
      expect(result.refresh_token).toBeDefined();
    });
  });

  describe('logout', () => {
    it('revokes the refresh token', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');
      refreshTokenRepository.findOne.mockResolvedValue(
        createMockRefreshToken({ isRevoked: false }),
      );

      await service.logout('some-refresh-token');

      expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { hashedToken: 'hashed-token' },
      });
    });

    it('handles logout with non-existent token gracefully', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.logout('non-existent-token')).resolves.not.toThrow();
    });
  });
});
