import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  BadRequestException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../src/modules/auth/auth.service';

function axiosError(status: number | undefined, message?: string): AxiosError {
  const error = new AxiosError('Request failed');
  if (status !== undefined) {
    error.response = {
      status,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: message ? { error: { message } } : {},
    };
  }
  return error;
}

describe('AuthService error propagation', () => {
  let service: AuthService;
  let httpService: HttpService;

  const mockUser = { id: 1, email: 'a@b.com', username: 'ab' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: HttpService, useValue: { post: vi.fn(), get: vi.fn() } },
        { provide: JwtService, useValue: { sign: vi.fn().mockReturnValue('jwt') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('login maps CMS 400 to UnauthorizedException instead of leaking a 500', async () => {
    vi.mocked(httpService.post).mockReturnValueOnce(
      throwError(() => axiosError(400, 'Invalid identifier or password')),
    );

    await expect(service.login('a@b.com', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login maps an unreachable CMS to ServiceUnavailableException', async () => {
    vi.mocked(httpService.post).mockReturnValueOnce(
      throwError(() => axiosError(undefined)),
    );

    await expect(service.login('a@b.com', 'pw')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('register surfaces the CMS validation message as a BadRequestException', async () => {
    vi.mocked(httpService.post).mockReturnValueOnce(
      throwError(() => axiosError(400, 'Email is already taken')),
    );

    await expect(service.register('a@b.com', 'ab', 'password123')).rejects.toMatchObject({
      status: 400,
      message: 'Email is already taken',
    });
  });

  it('login succeeds and returns a signed token', async () => {
    vi.mocked(httpService.post).mockReturnValueOnce(
      of({
        data: { user: mockUser },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }),
    );

    const result = await service.login('a@b.com', 'password123');
    expect(result.jwt).toBe('jwt');
    expect(result.user.email).toBe('a@b.com');
  });
});
