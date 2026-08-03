import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { OdooPermissionService } from './odoo-permission.service';
import { OdooApiService } from './odoo-api.service';

describe('OdooPermissionService', () => {
  let service: OdooPermissionService;

  const mockExecuteKw = vi.fn();
  const mockOdooApi = {
    connect: vi.fn().mockResolvedValue({ execute_kw: mockExecuteKw }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OdooPermissionService,
        { provide: OdooApiService, useValue: mockOdooApi },
      ],
    }).compile();

    service = module.get<OdooPermissionService>(OdooPermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignGroupsToUser', () => {
    it('creates the user when it does not exist and assigns the resolved groups', async () => {
      mockExecuteKw
        // ir.model.data search_read resolves the group XMLIDs to res.groups ids
        .mockResolvedValueOnce([{ res_id: 101 }, { res_id: 102 }])
        // res.users search finds no existing user
        .mockResolvedValueOnce([])
        // res.users create returns the new user id
        .mockResolvedValueOnce(99)
        // res.users write confirms the group assignment
        .mockResolvedValueOnce(true);

      const result = await service.assignGroupsToUser('new@hexastudio.net', [
        'project.group_project_manager',
        'project.group_project_user',
      ]);

      expect(result).toEqual({ uid: 99, created: true });

      // Groups are resolved via ir.model.data using the short XMLID names
      expect(mockExecuteKw).toHaveBeenNthCalledWith(
        1,
        'ir.model.data',
        'search_read',
        [
          [
            ['model', '=', 'res.groups'],
            ['name', 'in', ['group_project_manager', 'group_project_user']],
          ],
          ['res_id'],
        ],
      );

      expect(mockExecuteKw).toHaveBeenNthCalledWith(2, 'res.users', 'search', [
        [['login', '=', 'new@hexastudio.net']],
      ]);

      expect(mockExecuteKw).toHaveBeenNthCalledWith(3, 'res.users', 'create', [
        {
          login: 'new@hexastudio.net',
          name: 'new@hexastudio.net',
          email: 'new@hexastudio.net',
          groups_id: [
            [4, 101],
            [4, 102],
          ],
        },
      ]);

      // Existing-user path also runs after creation ([4, id] add semantics are idempotent)
      expect(mockExecuteKw).toHaveBeenNthCalledWith(4, 'res.users', 'write', [
        [99],
        {
          groups_id: [
            [4, 101],
            [4, 102],
          ],
        },
      ]);
    });

    it('assigns groups to an existing user without creating a new one (regression: groupMap key bug)', async () => {
      mockExecuteKw
        // ir.model.data search_read resolves the group XMLIDs to res.groups ids
        .mockResolvedValueOnce([{ res_id: 101 }, { res_id: 102 }])
        // res.users search finds the existing user
        .mockResolvedValueOnce([42])
        // res.users write confirms the group assignment
        .mockResolvedValueOnce(true);

      const result = await service.assignGroupsToUser('existing@hexastudio.net', [
        'project.group_project_manager',
        'project.group_project_user',
      ]);

      expect(result).toEqual({ uid: 42, created: false });

      // The resolved group ids must be passed through to write (previously groupMap[uid]
      // was undefined because resolveGroups returned a placeholder key of 0).
      expect(mockExecuteKw).toHaveBeenNthCalledWith(3, 'res.users', 'write', [
        [42],
        {
          groups_id: [
            [4, 101],
            [4, 102],
          ],
        },
      ]);

      expect(mockExecuteKw).not.toHaveBeenCalledWith('res.users', 'create', expect.anything());
    });
  });

  describe('provisionAdminUser', () => {
    it('assigns the four project/CRM/accounting groups to it@hexastudio.net', async () => {
      const assignSpy = vi
        .spyOn(service, 'assignGroupsToUser')
        .mockResolvedValue({ uid: 1, created: false });

      await service.provisionAdminUser();

      expect(assignSpy).toHaveBeenCalledTimes(1);
      expect(assignSpy).toHaveBeenCalledWith('it@hexastudio.net', [
        'project.group_project_manager',
        'project.group_project_user',
        'sales_team.group_sale_manager',
        'account.group_account_manager',
      ]);
    });
  });
});
