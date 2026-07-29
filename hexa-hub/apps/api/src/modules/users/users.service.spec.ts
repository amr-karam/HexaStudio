import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'uuid-1',
    email: 'amr@hexastudio.net',
    password: 'hashed',
    fullName: 'Amr Mohamed',
    role: UserRole.EMPLOYEE,
    isActive: true,
    twoFactorSecret: null,
    twoFactorEnabled: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('returns the user when found', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail('amr@hexastudio.net');
      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'amr@hexastudio.net' } });
      expect(result).toEqual(mockUser);
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.findByEmail('ghost@hexastudio.net');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('queries by primary key', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      const result = await service.findById('uuid-1');
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('creates and saves the entity', async () => {
      const input = { email: 'new@hexastudio.net', password: 'hash', fullName: 'New' };
      repo.create.mockReturnValue(mockUser);
      repo.save.mockResolvedValue(mockUser);

      const result = await service.create(input);

      expect(repo.create).toHaveBeenCalledWith(input);
      expect(repo.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
