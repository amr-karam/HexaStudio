import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import {
  AccountingModule,
  AgentsModule,
  AIModule,
  ArticlesModule,
  AssistantsModule,
  AuthModule,
  ContactModule,
  CurrencyModule,
  FAQsModule,
  HealthModule,
  MetricsModule,
  MobileModule,
  OdooModule,
  PortalModule,
  ProjectsModule,
  RealtimeModule,
  RedisModule,
  RequestsModule,
  ServicesModule,
  StorageModule,
  TeamMembersModule,
  TestimonialsModule,
  UsersModule,
  VectorModule,
  WebhooksModule,
  TranslationsModule,
  GeoipModule,
} from "./modules/index";

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
    TestimonialsModule,
    TeamMembersModule,
    FAQsModule,
    ContactModule,
    AuthModule,
    StorageModule,
    RedisModule,
    CurrencyModule,
    OdooModule,
    PortalModule,
    UsersModule,
    RequestsModule,
    AccountingModule,
    VectorModule,
    RealtimeModule,
    AIModule,
    MetricsModule,
    AgentsModule,
    AssistantsModule,
    WebhooksModule,
    // NotionModule and JiraModule removed — Odoo covers all needs
  TranslationsModule,
  MobileModule,
  GeoipModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
