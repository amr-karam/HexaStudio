import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NotionService } from './notion.service';
import { NotionController } from './notion.controller';

@Module({
  imports: [HttpModule],
  controllers: [NotionController],
  providers: [NotionService],
  exports: [NotionService],
})
export class NotionModule {}
