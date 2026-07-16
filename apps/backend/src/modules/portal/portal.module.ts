import { Module } from '@nestjs/common';
import { ClientPortalGateway } from './client-portal.gateway';

@Module({
  controllers: [],
  providers: [ClientPortalGateway],
})
export class PortalModule {}
