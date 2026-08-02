import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppThrottlerModule } from './common/throttler/throttler.module';
import { AuditModule } from './common/audit/audit.module';
import { EventsModule } from './common/events/events.module';
import { CacheManagerModule } from './common/cache/cache.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { MessagesModule } from './modules/messages/messages.module';
import { AiModule } from './modules/ai/ai.module';
import { OdooModule } from './modules/odoo/odoo.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { CrmModule } from './modules/crm/crm.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { SalesModule } from './modules/sales/sales.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { PortalModule } from './modules/portal/portal.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { HelpdeskModule } from './modules/helpdesk/helpdesk.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { TimesheetsModule } from './modules/timesheets/timesheets.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { typeOrmConfig } from './database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    // Infrastructure
    AppThrottlerModule,
    AuditModule,
    EventsModule,
    CacheManagerModule,
    // Core
    UsersModule, AuthModule, WorkspacesModule, MessagesModule, AiModule, ChannelsModule,
    // Odoo Integration
    OdooModule, ProjectsModule, CrmModule, ContactsModule, SalesModule, TasksModule,
    ActivitiesModule, AccountingModule, HelpdeskModule, CalendarModule, EmployeesModule,
    TimesheetsModule, KnowledgeModule, DocumentsModule,
    // Hub-native
    NotificationsModule, SearchModule, PortalModule, ApprovalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
