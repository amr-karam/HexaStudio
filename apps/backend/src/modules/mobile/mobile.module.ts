import { Module } from '@nestjs/common';
import { MobileApiController } from './mobile.controller';
import { MobileApiService } from './mobile.service';
import { AuthModule } from '../auth';

@Module({
  imports: [AuthModule],
  controllers: [MobileApiController],
  providers: [MobileApiService],
  exports: [MobileApiService],
})
export class MobileModule {}