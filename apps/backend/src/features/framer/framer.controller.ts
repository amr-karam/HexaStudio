import { Controller, Post, Get, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('framer')
export class FramerController {
  private readonly key: string;
  constructor(private cfg: ConfigService) {
    this.key = this.cfg.get<string>('FRAMER_API_KEY') ?? '';
  }

  @Post('publish')
  async publish(@Body() payload: { siteId: string; documentName?: string }) {
    const res = await axios.post(
      'https://api.framer.com/v1/sites/' + payload.siteId + '/publish',
      payload,
      {
        headers: { Authorization: 'Bearer ' + this.key, 'Content-Type': 'application/json' },
        timeout: 10000,
      },
    );
    return res.data;
  }

  @Get('status')
  async status() {
    return { keyPresent: !!this.key, source: 'backend-only' };
  }
}