import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import type { AchievementResponse } from '@hexastudio/types';

@ApiTags('Achievements')
@Controller({ path: 'achievements', version: VERSION_NEUTRAL })
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: 'List all achievements sorted by order' })
  async findAll(): Promise<AchievementResponse> {
    return this.achievementsService.getAllAchievements();
  }
}
