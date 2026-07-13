import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Workspace } from '../modules/workspaces/entities/workspace.entity';
import { Task } from '../modules/workspaces/entities/task.entity';
import { Message } from '../modules/messages/entities/message.entity';
import { Project } from '../modules/projects/entities/project.entity';

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'hub_user',
  password: process.env.DB_PASSWORD || 'hub_password',
  database: process.env.DB_NAME || 'hub_db',
  entities: [User, Workspace, Task, Message, Project],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  migrationsRun: process.env.DB_RUN_MIGRATIONS === 'true',
  logging: process.env.DB_LOGGING === 'true',
};

export default new DataSource(typeOrmConfig);
