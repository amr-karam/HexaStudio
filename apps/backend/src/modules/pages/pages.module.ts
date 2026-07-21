import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

@Module({
  imports: [HttpModule],
  controllers: [PagesController],
  providers: [PagesService],
})
export class PagesModule {}
