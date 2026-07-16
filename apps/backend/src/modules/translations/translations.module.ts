import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';

@Module({
  imports: [HttpModule],
  controllers: [TranslationController],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationsModule {}
