import { Controller, Post, Body, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { OdooPermissionService } from './odoo-permission.service';
import { AssignGroupsDto } from './dto/assign-groups.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Odoo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller({ path: 'odoo/permissions', version: ['1', VERSION_NEUTRAL] })
export class OdooPermissionController {
  constructor(private readonly odooPermission: OdooPermissionService) {}

  @Post('assign-groups')
  @ApiOperation({ summary: 'Assign Odoo security groups to a user (creates the user if missing)' })
  @ApiResponse({
    status: 201,
    description: 'Groups assigned to the user',
    schema: {
      type: 'object',
      properties: {
        uid: { type: 'number', description: 'Odoo user ID' },
        created: { type: 'boolean', description: 'Whether the user was created' },
      },
    },
  })
  async assignGroups(@Body() dto: AssignGroupsDto) {
    return this.odooPermission.assignGroupsToUser(dto.login, dto.groups);
  }

  @Post('provision-admin')
  @ApiOperation({ summary: 'Provision the it@hexastudio.net admin user with project/CRM/accounting access' })
  @ApiResponse({
    status: 201,
    description: 'Admin user provisioned',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
      },
    },
  })
  async provisionAdmin() {
    await this.odooPermission.provisionAdminUser();
    return { ok: true };
  }
}
