import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { Workspace } from './entities/workspace.entity';
import { Task } from './entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, Task])],
  providers: [WorkspacesService, ClientService],
  controllers: [WorkspacesController, ClientController],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
