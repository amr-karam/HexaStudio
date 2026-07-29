import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.enum';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('returns access_token and sanitized user on valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('signed-jwt');

      const result = await service.login('amr@hexastudio.net', 'secret');

      if ('requiresTwoFactor' in result) throw new Error('Unexpected 2FA response');
      expect(result.access_token).toBe('signed-jwt');
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
});
