import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../src/modules/users/users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findByEmail', () => {
    it('returns admin user by email', async () => {
      const user = await service.findByEmail('admin@hexastudio.net');
      expect(user).toBeDefined();
      expect(user?.role).toBe('admin');
      expect(user?.name).toBe('Admin User');
    });

    it('returns client user by email', async () => {
      const user = await service.findByEmail('client@example.com');
      expect(user).toBeDefined();
      expect(user?.role).toBe('client');
    });

    it('returns undefined for unknown email', async () => {
      const user = await service.findByEmail('unknown@example.com');
      expect(user).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('returns user by id', async () => {
      const user = await service.findById('1');
      expect(user).toBeDefined();
      expect(user?.email).toBe('admin@hexastudio.net');
    });

    it('returns undefined for unknown id', async () => {
      const user = await service.findById('999');
      expect(user).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('returns all users', async () => {
      const users = await service.findAll();
      expect(users).toHaveLength(2);
      expect(users.map((u) => u.role)).toContain('admin');
      expect(users.map((u) => u.role)).toContain('client');
    });
  });
});
