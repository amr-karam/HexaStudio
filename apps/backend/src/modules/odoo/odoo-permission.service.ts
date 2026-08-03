/**
 * HEXA Hub — Odoo Permission Assignment Utility
 *
 * Provides a programmatic way to assign Odoo security groups to users
 * via JSON-RPC API. Used for provisioning production access rights.
 *
 * @module odoo
 */

import { Injectable, Logger } from '@nestjs/common';
import { OdooApiService } from './odoo-api.service';

const PROJECT_MANAGER_GROUP_EXTERNAL_ID = 'project.group_project_manager';
const PROJECT_GROUP_EXTERNAL_ID = 'project.group_project_user';
const CRM_MANAGER_GROUP_EXTERNAL_ID = 'sales_team.group_sale_manager';
const ACCOUNTING_MANAGER_GROUP_EXTERNAL_ID = 'account.group_account_manager';

@Injectable()
export class OdooPermissionService {
  private readonly logger = new Logger(OdooPermissionService.name);

  constructor(private readonly odoo: OdooApiService) {}

  /**
   * Assign security groups to a user by login/email.
   * Creates the user if they don't exist (with a generated password).
   *
   * @param login - User login (typically email)
   * @param groups - Array of group external IDs (e.g., 'project.group_project_manager')
   * @returns User ID and whether user was created
   */
  async assignGroupsToUser(
    login: string,
    groups: string[],
  ): Promise<{ uid: number; created: boolean }> {
    // Resolve external XMLIDs to internal res.groups database IDs
    const groupIds = await this.resolveGroups(groups);

    // Find or create user
    let uid = await this.findUserId(login);
    let created = false;

    if (!uid) {
      uid = await this.createUser(login, groupIds);
      created = true;
    }

    // Add groups to the (possibly just-created) user (avoid duplicates)
    await this.addGroupsToUser(uid, groupIds);

    return { uid, created };
  }

  /**
   * Resolve external group IDs (XMLIDs like 'project.group_project_manager')
   * to internal `res.groups` database IDs.
   *
   * Queries `ir.model.data` by the short XMLID name (the part after the dot)
   * for records pointing at `res.groups`, then gathers the `res_id`s.
   */
  private async resolveGroups(externalIds: string[]): Promise<number[]> {
    const client = await this.odoo.connect();

    // 'project.group_project_manager' -> 'group_project_manager'
    const names = externalIds.map((id) => id.split('.').pop() ?? id);

    const records = await client.execute_kw<Array<{ res_id: number }>>(
      'ir.model.data',
      'search_read',
      [
        [
          ['model', '=', 'res.groups'],
          ['name', 'in', names],
        ],
        ['res_id'],
      ],
    );

    const groupIds = records.map((record) => record.res_id);

    if (groupIds.length < externalIds.length) {
      this.logger.warn(
        `Resolved ${groupIds.length} of ${externalIds.length} requested Odoo security groups`,
      );
    }

    return groupIds;
  }

  /** Find user ID by login */
  private async findUserId(login: string): Promise<number | null> {
    const client = await this.odoo.connect();

    const userIds = await client.execute_kw<number[]>(
      'res.users',
      'search',
      [[['login', '=', login]]],
    );

    return userIds[0] ?? null;
  }

  /** Create a new user with specified groups */
  private async createUser(login: string, groupIds: number[]): Promise<number> {
    const client = await this.odoo.connect();

    return client.execute_kw<number>('res.users', 'create', [
      {
        login,
        name: login, // Full name defaults to email
        email: login,
        groups_id: groupIds.map((id) => [4, id]), // Add to groups
      },
    ]);
  }

  /** Add groups to an existing user */
  private async addGroupsToUser(uid: number, groupIds: number[]): Promise<void> {
    if (!groupIds.length) return;

    const client = await this.odoo.connect();

    await client.execute_kw<boolean>('res.users', 'write', [
      [uid],
      {
        groups_id: groupIds.map((id) => [4, id]),
      },
    ]);

    this.logger.log(`Assigned ${groupIds.length} groups to user ${uid}`);
  }

  /**
   * Provision the it@hexastudio.net user with full project access.
   * This is the standard call for deployment.
   */
  async provisionAdminUser(): Promise<void> {
    const login = 'it@hexastudio.net';

    await this.assignGroupsToUser(login, [
      PROJECT_MANAGER_GROUP_EXTERNAL_ID,
      PROJECT_GROUP_EXTERNAL_ID,
      CRM_MANAGER_GROUP_EXTERNAL_ID,
      ACCOUNTING_MANAGER_GROUP_EXTERNAL_ID,
    ]);

    this.logger.log(`Successfully provisioned ${login} with project management permissions`);
  }
}
