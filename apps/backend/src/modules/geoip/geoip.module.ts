import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeoipService } from './geoip.service';
import { GeoipController } from './geoip.controller';

@Module({
  imports: [HttpModule],
  controllers: [GeoipController],
  providers: [GeoipService],
  exports: [GeoipService],
})
export class GeoipModule {}
