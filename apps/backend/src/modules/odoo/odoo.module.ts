import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OdooService } from './odoo.service';

@Module({
  imports: [ConfigModule],
  providers: [OdooService],
  exports: [OdooService],
})
export class OdooModule {}
