import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { OdooModule } from '../odoo/odoo.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [OdooModule, AIModule],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
