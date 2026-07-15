import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { HealthModule } from "./modules/health/health.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { ArticlesModule } from "./modules/articles/articles.module";
import { ServicesModule } from "./modules/services/services.module";
import { ContactModule } from "./modules/contact/contact.module";
import { AuthModule } from "./modules/auth/auth.module";
import { StorageModule } from "./modules/storage/storage.module";
import { RedisModule } from "./modules/storage/redis.module";
import { OdooModule } from "./modules/odoo/odoo.module";
import { PortalModule } from "./modules/portal/portal.module";
import { UsersModule } from "./modules/users/users.module";
import { RequestsModule } from "./modules/requests/requests.module";
import { AccountingModule } from "./modules/accounting/accounting.module";
import { VectorModule } from "./modules/vector/vector.module";
import { AIModule } from "./modules/ai/ai.module";
import { MetricsModule } from "./modules/metrics/metrics.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL ?? "60", 10) * 1000,
        limit: parseInt(process.env.RATE_LIMIT_MAX ?? "100", 10),
      },
    ]),
    HealthModule,
    ProjectsModule,
    ArticlesModule,
    ServicesModule,
    ContactModule,
    AuthModule,
    StorageModule,
    RedisModule,
    OdooModule,
    PortalModule,
    UsersModule,
    RequestsModule,
    AccountingModule,
    VectorModule,
    AIModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
