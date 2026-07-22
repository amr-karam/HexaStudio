// Type augmentation for @nestjs/config v4.x
// The package's dist/index.d.ts barrel is empty in v4.0.x, causing TS2305 errors.
// This re-declares the module with proper exports.
declare module '@nestjs/config' {
  export { ConfigModule } from '@nestjs/config/dist/config.module';
  export { ConfigService, ConfigGetOptions } from '@nestjs/config/dist/config.service';
  export { registerAs } from '@nestjs/config/dist/utils';
  export { getConfigToken } from '@nestjs/config/dist/utils';
  export { ConditionalModule } from '@nestjs/config/dist/conditional.module';
}
