import type { User } from './user';
export interface AuthTokens {
    access_token: string;
    refresh_token?: string;
}
export interface LoginResponse extends AuthTokens {
    user: User;
}
//# sourceMappingURL=auth.d.ts.map