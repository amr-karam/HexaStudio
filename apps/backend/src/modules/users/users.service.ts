import { Injectable } from '@nestjs/common';
import type { User } from '@hexastudio/types';

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: '1', email: 'admin@hexastudio.net', username: 'admin', role: 'admin' },
    { id: '2', email: 'client@example.com', username: 'client', role: 'user' },
  ];

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }
}
