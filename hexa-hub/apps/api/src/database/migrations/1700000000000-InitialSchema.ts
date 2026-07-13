import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER_ADMIN', 'EMPLOYEE', 'CLIENT')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."tasks_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "fullName" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'EMPLOYEE',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "workspaces" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "slug" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "ownerId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_workspaces" PRIMARY KEY ("id"),
        CONSTRAINT "FK_workspaces_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'TODO',
        "dueDate" TIMESTAMP,
        "workspaceId" uuid,
        "assigneeId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tasks_workspace" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id"),
        CONSTRAINT "FK_tasks_assignee" FOREIGN KEY ("assigneeId") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "senderId" uuid NOT NULL,
        "receiverId" uuid NOT NULL,
        "content" text NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "type" character varying,
        "fileUrl" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_messages_sender" FOREIGN KEY ("senderId") REFERENCES "users"("id"),
        CONSTRAINT "FK_messages_receiver" FOREIGN KEY ("receiverId") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_messages_sender_receiver" ON "messages" ("senderId", "receiverId")
    `);

    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "coverImage" character varying,
        "modelUrl" character varying,
        "client" character varying,
        "location" character varying,
        "year" integer,
        "area" character varying,
        "services" text array,
        "isPublished" boolean NOT NULL DEFAULT true,
        "ownerId" uuid,
        "workspaceId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_projects" PRIMARY KEY ("id"),
        CONSTRAINT "FK_projects_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id"),
        CONSTRAINT "FK_projects_workspace" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_messages_sender_receiver"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "workspaces"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
