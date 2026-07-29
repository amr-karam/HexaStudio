import { Module, Global } from '@nestjs/common';
import { MentionService } from './mention.service';

@Global()
@Module({
  providers: [MentionService],
  exports: [MentionService],
})
export class MentionCommonModule {}