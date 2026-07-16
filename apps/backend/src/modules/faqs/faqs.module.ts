import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FAQsController } from './faqs.controller';
import { FAQsService } from './faqs.service';

@Module({
  imports: [HttpModule],
  controllers: [FAQsController],
  providers: [FAQsService],
})
export class FAQsModule {}
