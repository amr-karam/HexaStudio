import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactsService } from './contacts.service';

@Controller('odoo/contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
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
  async getClientContacts() {
    return this.contactsService.getClientContacts();
  }

  @Get(':id')
  async getContact(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.contactsService.getContact(id) };
  }

  @Post()
  async createContact(@Body() body: Record<string, unknown>) {
    return { data: await this.contactsService.createContact(body) };
  }

  @Patch(':id')
  async updateContact(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return { data: await this.contactsService.updateContact(id, body) };
  }

  @Delete(':id')
  async deleteContact(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.contactsService.deleteContact(id) };
  }
}
