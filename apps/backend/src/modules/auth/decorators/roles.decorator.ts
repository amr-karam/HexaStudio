import { SetMetadata } from '@nestjs/common';
import type { User } from '@hexastudio/types';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: User['role'][]) => SetMetadata(ROLES_KEY, roles);
