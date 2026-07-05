import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [HttpModule],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
