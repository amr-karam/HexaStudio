import { Module } from '@nestjs/common';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { OdooModule } from '../odoo/odoo.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [OdooModule, AuthModule],
  controllers: [AccountingController],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule {}
