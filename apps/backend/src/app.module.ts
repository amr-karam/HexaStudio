import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { SecurityThrottlerFilter } from "./common/filters/security-throttler.filter";
import {
  AccountingModule,
  AgentsModule,
  AIModule,
  ArticlesModule,
  AssistantsModule,
  AuthModule,
  CalendarModule,
  ContactModule,
  CurrencyModule,
  DocumentsModule,
  EmployeesModule,
  FAQsModule,
  HealthModule,
  HelpdeskModule,
  KnowledgeModule,
  MetricsModule,
  MobileModule,
  OdooModule,
  PagesModule,
  AchievementsModule,
  PortalModule,
  ProjectsModule,
  RealtimeModule,
  RedisModule,
  RequestsModule,
  ServicesModule,
  StorageModule,
  TeamMembersModule,
  TestimonialsModule,
  TimesheetsModule,
  UsersModule,
  VectorModule,
  WebhooksModule,
  TranslationsModule,
  GeoipModule,
  WorkflowModule,
} from "./modules/index";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";
import { WorkflowWiringService } from "./modules/workflow/workflow-wiring.service";

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
    HelpdeskModule,
    CalendarModule,
    EmployeesModule,
    TimesheetsModule,
    KnowledgeModule,
    DocumentsModule,
    ProjectsModule,
    ArticlesModule,
    PagesModule,
    AchievementsModule,
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
  WorkflowModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: SecurityThrottlerFilter },
    WorkflowWiringService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
