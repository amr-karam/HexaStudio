import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class MobileApiService {
  constructor(private authService: AuthService) {}

  async register(body: { email: string, username: string, password: string }) {
    return this.authService.register(body.email, body.username, body.password);
  }

  async login(body: { identifier: string, password: string }) {
    return this.authService.login(body.identifier, body.password);
  }
}