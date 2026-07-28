import { Module } from '@nestjs/common';
import { OdooModule } from '../odoo/odoo.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [OdooModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
