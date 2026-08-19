import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.enum';
import { CacheManagerService } from '../../common/cache/cache.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;
  let qbBuilder: { where: jest.Mock; addSelect: jest.Mock; getOne: jest.Mock };

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
    qbBuilder = {
      where: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: CacheManagerService,
          useValue: {
            generateKey: jest.fn(),
            watch: jest.fn(async (_key: string, factory: () => Promise<unknown>) => factory()),
            del: jest.fn(),
            delByPattern: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => qbBuilder),
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
      qbBuilder.getOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail('amr@hexastudio.net');
      expect(repo.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(qbBuilder.where).toHaveBeenCalledWith('user.email = :email', { email: 'amr@hexastudio.net' });
      expect(qbBuilder.addSelect).toHaveBeenCalledWith('user.password');
      expect(qbBuilder.addSelect).toHaveBeenCalledWith('user.twoFactorSecret');
      expect(result).toEqual(mockUser);
    });

    it('returns null when not found', async () => {
      qbBuilder.getOne.mockResolvedValue(null);
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
