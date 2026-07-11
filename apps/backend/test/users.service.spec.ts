import './setup';
import { UsersService } from '../src/modules/users/users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
  });

  it('findAll returns all seeded users', async () => {
    const users = await service.findAll();
    expect(users).toHaveLength(2);
    expect(users.map(u => u.role)).toEqual(['admin', 'client']);
  });

  it('findByEmail returns the matching user', async () => {
    const user = await service.findByEmail('admin@hexastudio.net');
    expect(user).toBeDefined();
    expect(user?.id).toBe('1');
    expect(user?.role).toBe('admin');
  });

  it('findByEmail returns undefined for an unknown email', async () => {
    const user = await service.findByEmail('nobody@example.com');
    expect(user).toBeUndefined();
  });

  it('findById returns the matching user', async () => {
    const user = await service.findById('2');
    expect(user).toBeDefined();
    expect(user?.email).toBe('client@example.com');
  });

  it('findById returns undefined for an unknown id', async () => {
    const user = await service.findById('999');
    expect(user).toBeUndefined();
  });
});
