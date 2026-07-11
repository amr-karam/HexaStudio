import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      message: 'HEXA Hub API is operational',
    };
  }
}
