import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { User } from './modules/users/entities/user.entity';
import { Workspace } from './modules/workspaces/entities/workspace.entity';
import { Task } from './modules/workspaces/entities/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'hub_user',
      password: process.env.DB_PASSWORD || 'hub_password',
      database: process.env.DB_NAME || 'hub_db',
      entities: [User, Workspace, Task],
      synchronize: true, // Set to false in production
    }),
    UsersModule,
    AuthModule,
    WorkspacesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
