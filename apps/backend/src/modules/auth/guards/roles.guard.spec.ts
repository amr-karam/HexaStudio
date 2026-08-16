import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { RolesGuard } from './roles.guard';
import { SecurityAuditService } from '../../security/security-audit.service';

describe('RolesGuard', () => {
  const createContext = (role?: 'admin' | 'editor' | 'user'): ExecutionContext => ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({
        user: role
          ? { id: '1', email: 'user@example.com', username: 'user', role }
          : undefined,
        url: '/api/protected',
        method: 'GET',
      }),
    }),
  }) as unknown as ExecutionContext;

  const createGuard = (audit: SecurityAuditService) =>
    new RolesGuard(
      { getAllAndOverride: vi.fn().mockReturnValue(['admin']) } as unknown as Reflector,
      audit,
    );

  const createAuditMock = () =>
    ({ logEvent: vi.fn() }) as unknown as SecurityAuditService;

  it('allows a user with a required role', () => {
    const audit = createAuditMock();
    expect(createGuard(audit).canActivate(createContext('admin'))).toBe(true);
    expect(audit.logEvent).not.toHaveBeenCalled();
  });

  it('rejects a user without a required role', () => {
    const audit = createAuditMock();
    expect(createGuard(audit).canActivate(createContext('user'))).toBe(false);
  });

  it('logs an RBAC_FAILURE audit event when a user lacks the required role', () => {
    const audit = createAuditMock();
    createGuard(audit).canActivate(createContext('user'));

    expect(audit.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'RBAC_FAILURE',
        userId: '1',
        details: expect.objectContaining({ requiredRoles: ['admin'], userRole: 'user' }),
      }),
    );
  });

  it('logs an RBAC_FAILURE audit event when no user is present', () => {
    const audit = createAuditMock();
    createGuard(audit).canActivate(createContext());

    expect(audit.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'RBAC_FAILURE', userId: undefined }),
    );
  });
});
