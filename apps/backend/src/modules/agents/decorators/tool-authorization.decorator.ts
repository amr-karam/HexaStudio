import { SetMetadata } from '@nestjs/common';
import { TOOL_AUTHORIZATION_METADATA } from './constants';

export interface ToolAuthorizationOptions {
  requiresAuth: boolean;
  requiresHitl: boolean; // Human-in-the-loop for mutative actions
  roles?: string[];
}

export const ToolAuthorization = (auth: ToolAuthorizationOptions) =>
  SetMetadata(TOOL_AUTHORIZATION_METADATA, auth);
