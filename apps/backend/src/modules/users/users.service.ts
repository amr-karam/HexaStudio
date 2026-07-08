import { Injectable } from '@nestjs/common';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
  name: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: '1', email: 'admin@hexastudio.net', role: 'admin', name: 'Admin User' },
    { id: '2', email: 'client@example.com', role: 'client', name: 'Client User' },
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
