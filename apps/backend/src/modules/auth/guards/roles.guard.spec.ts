import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const createContext = (role?: 'admin' | 'editor' | 'user'): ExecutionContext => ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { id: '1', email: 'user@example.com', username: 'user', role } : undefined }),
    }),
  }) as unknown as ExecutionContext;

  it('allows a user with a required role', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(['admin']) } as unknown as Reflector;
    expect(new RolesGuard(reflector).canActivate(createContext('admin'))).toBe(true);
  });

  it('rejects a user without a required role', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(['admin']) } as unknown as Reflector;
    expect(new RolesGuard(reflector).canActivate(createContext('user'))).toBe(false);
  });
});
