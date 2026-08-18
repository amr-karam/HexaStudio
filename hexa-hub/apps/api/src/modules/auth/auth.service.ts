import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // ─── Standard Auth ───────────────────────────────────────────────────────

  async login(
    email: string,
    pass: string,
  ): Promise<
    | { access_token: string; user: { id: string; email: string; fullName: string; role: string } }
    | { requiresTwoFactor: true; userId: string; tempToken: string }
  > {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    if (user.twoFactorEnabled) {
      const tempToken = this.jwtService.sign(
        { sub: user.id, purpose: '2fa-pending' },
        { expiresIn: '5m' },
      );
      return {
        requiresTwoFactor: true,
        userId: user.id,
        tempToken,
      };
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async register(userData: CreateUserDto) {
    const hashedPass = await bcrypt.hash(userData.password, 10);
    return this.usersService.create({
      ...userData,
      password: hashedPass,
    });
  }

  // ─── Two-Factor Authentication (TOTP) ────────────────────────────────────

  async generateTwoFactorSecret(userId: string): Promise<{ secret: string; otpauth_url: string; qrCode: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const secret = speakeasy.generateSecret({
      name: `HEXA Hub (${user.email})`,
      length: 20,
    });

    const qrCode = await qrcode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url || '',
      qrCode,
    };
  }

  async enableTwoFactor(userId: string, token: string): Promise<{ enabled: boolean; recoveryCodes: string[] }> {
    const user = await this.usersService.findByEmail(
      (await this.usersService.findById(userId))?.email || '',
    );
    if (!user) throw new NotFoundException('User not found');

    const userWithSecret = await this.usersService.findByEmail(user.email);
    if (!userWithSecret || !userWithSecret.twoFactorSecret) {
      throw new BadRequestException('No 2FA secret found. Generate one first via POST /auth/2fa/generate.');
    }

    const verified = speakeasy.totp.verify({
      secret: userWithSecret.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      throw new BadRequestException('Invalid TOTP token. Please try again.');
    }

    await this.usersService.update(userId, { twoFactorEnabled: true });

    const recoveryCodes = Array.from({ length: 8 }, () =>
      Array.from({ length: 10 }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(
          Math.floor(Math.random() * 36),
        ),
      ).join(''),
    );

    return { enabled: true, recoveryCodes };
  }

  async disableTwoFactor(userId: string): Promise<{ disabled: boolean }> {
    await this.usersService.update(userId, {
      twoFactorSecret: null,
      twoFactorEnabled: false,
    });
    return { disabled: true };
  }

  async verifyTwoFactorAndLogin(
    userId: string,
    tempToken: string,
    token: string,
  ): Promise<{ access_token: string; user: { id: string; email: string; fullName: string; role: string } }> {
    let tempPayload: { sub: string; purpose: string };
    try {
      tempPayload = this.jwtService.verify<{ sub: string; purpose: string }>(tempToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired temporary token. Please login again.');
    }

    if (tempPayload.sub !== userId || tempPayload.purpose !== '2fa-pending') {
      throw new UnauthorizedException('Invalid temporary token.');
    }

    const user = await this.usersService.findByEmail(
      (await this.usersService.findById(userId))?.email || '',
    );
    if (!user) throw new NotFoundException('User not found');

    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA is not configured for this user.');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA token.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user) return false;

    const userWithSecret = await this.usersService.findByEmail(user.email);
    if (!userWithSecret || !userWithSecret.twoFactorSecret) return false;

    return speakeasy.totp.verify({
      secret: userWithSecret.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }

  async setTwoFactorSecret(userId: string, secret: string): Promise<void> {
    await this.usersService.update(userId, {
      twoFactorSecret: secret,
      twoFactorEnabled: false,
    });
  }

  // ─── Token Validation (for WebSocket gateways) ────────────────────────────

  async validateToken(token: string): Promise<{ id: string; email: string; name?: string; role?: string; currentWorkspaceId?: string; avatar?: string } | null> {
    try {
      const payload = this.jwtService.verify<{ sub: string; email: string; role?: string; currentWorkspaceId?: string; name?: string; avatar?: string }>(token);
      return {
        id: payload.sub,
        email: payload.email || '',
        name: payload.name,
        role: payload.role,
        currentWorkspaceId: payload.currentWorkspaceId,
        avatar: payload.avatar,
      };
    } catch {
      return null;
    }
  }
}
