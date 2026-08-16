import { DataSource, DataSourceOptions } from "typeorm";
import { User } from "../modules/users/entities/user.entity";
import { Workspace } from "../modules/workspaces/entities/workspace.entity";
import { Task } from "../modules/workspaces/entities/task.entity";
import { Message } from "../modules/messages/entities/message.entity";
import { Project } from "../modules/projects/entities/project.entity";
import { NotificationEntity } from "../modules/notifications/notifications.entity";
import { AuditLog } from "../common/audit/audit.entity";
import { WebhookLog } from "../modules/odoo/entities/webhook-log.entity";

if (!process.env.DB_PASSWORD) {
  throw new Error("DB_PASSWORD environment variable is required");
}

export const typeOrmConfig: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "hub_user",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "hub_db",
  entities: [User, Workspace, Task, Message, Project, NotificationEntity, AuditLog, WebhookLog],
  migrations: [__dirname + "/migrations/*.{ts,js}"],
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  migrationsRun: process.env.DB_RUN_MIGRATIONS === "true",
  logging: process.env.DB_LOGGING === "true",
};

export default new DataSource(typeOrmConfig);
