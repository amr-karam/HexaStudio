import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { typeOrmConfig } from './database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    // Core
    UsersModule,
    AuthModule,
    WorkspacesModule,
    MessagesModule,
    AiModule,
    // Odoo Integration
    OdooModule,
    ProjectsModule,
    CrmModule,
    ContactsModule,
    SalesModule,
    TasksModule,
    ActivitiesModule,
    // Hub-native
    NotificationsModule,
    SearchModule,
    PortalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
