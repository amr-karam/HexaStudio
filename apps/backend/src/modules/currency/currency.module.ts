import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CurrencyService } from './currency.service';
import { ExchangeRateSyncService } from './exchange-rate-sync.service';
import { CurrencyController, PricingController } from './currency.controller';
import { RedisModule } from '../storage/redis.module';

@Module({
  imports: [RedisModule, ScheduleModule.forRoot()],
  providers: [CurrencyService, ExchangeRateSyncService],
  controllers: [CurrencyController, PricingController],
  exports: [CurrencyService],
})
export class CurrencyModule {}
