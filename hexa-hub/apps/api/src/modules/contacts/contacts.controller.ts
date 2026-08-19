import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { ContactsService } from './contacts.service';

@Controller('odoo/contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getContacts(
    @Query('search') search?: string,
    @Query('is_client') is_client?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contactsService.getContacts({
      search,
      is_client: is_client !== undefined ? is_client === 'true' : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 25,
    });
  }

  @Get('clients')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getClientContacts() {
    return this.contactsService.getClientContacts();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getContact(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.contactsService.getContact(id) };
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async createContact(@Body() body: Record<string, unknown>) {
    return { data: await this.contactsService.createContact(body) };
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async updateContact(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return { data: await this.contactsService.updateContact(id, body) };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async deleteContact(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.contactsService.deleteContact(id) };
  }
}
