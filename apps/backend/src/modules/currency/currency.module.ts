import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyController, PricingController } from './currency.controller';
import { RedisModule } from '../storage/redis.module';

@Module({
  imports: [RedisModule],
  providers: [CurrencyService],
  controllers: [CurrencyController, PricingController],
  exports: [CurrencyService],
})
export class CurrencyModule {}
