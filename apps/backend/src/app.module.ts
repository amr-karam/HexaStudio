import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { SecurityThrottlerFilter } from "./common/filters/security-throttler.filter";
import { CoreModule } from "./core/core.module";
import {
  AccountingModule,
  AgentsModule,
  AIModule,
  ArticlesModule,
  AssistantsModule,
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
  RequestsModule,
  ServicesModule,
  TeamMembersModule,
  TestimonialsModule,
  TimesheetsModule,
  UsersModule,
  VectorModule,
  WebhooksModule,
  TranslationsModule,
  GeoipModule,
  WorkflowModule,
  StorageModule,
  RedisModule,
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
    CoreModule,
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
