import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── Extensions ────────────────────────────────────────────────────────────
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ─── Enums ─────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER_ADMIN', 'EMPLOYEE', 'CLIENT')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."tasks_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."channels_type_enum" AS ENUM('public', 'private', 'direct')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."channel_members_role_enum" AS ENUM('owner', 'admin', 'member')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."channel_messages_type_enum" AS ENUM('text', 'image', 'file', 'system')
    `);

    // ─── Table: users ─────────────────────────────────────────────────────────
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

    // ─── Table: workspaces ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "workspaces" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "slug" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "ownerId" uuid,
        "clientId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_workspaces" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "workspaces"
      ADD CONSTRAINT "FK_workspaces_owner"
      FOREIGN KEY ("ownerId") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "workspaces"
      ADD CONSTRAINT "FK_workspaces_client"
      FOREIGN KEY ("clientId") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // ─── Table: tasks ─────────────────────────────────────────────────────────
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
        CONSTRAINT "PK_tasks" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "tasks"
      ADD CONSTRAINT "FK_tasks_workspace"
      FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "tasks"
      ADD CONSTRAINT "FK_tasks_assignee"
      FOREIGN KEY ("assigneeId") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // ─── Table: messages ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "senderId" uuid NOT NULL,
        "receiverId" uuid NOT NULL,
        "content" text NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "type" character varying,
        "fileUrl" character varying,
        "replyTo" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_messages_sender"
      FOREIGN KEY ("senderId") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_messages_receiver"
      FOREIGN KEY ("receiverId") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_messages_sender_receiver"
      ON "messages" ("senderId", "receiverId")
    `);

    // ─── Table: projects ──────────────────────────────────────────────────────
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
        CONSTRAINT "PK_projects" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "projects"
      ADD CONSTRAINT "FK_projects_owner"
      FOREIGN KEY ("ownerId") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "projects"
      ADD CONSTRAINT "FK_projects_workspace"
      FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // ─── Table: notifications ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "title" character varying NOT NULL,
        "body" text NOT NULL,
        "channel" character varying NOT NULL DEFAULT 'in_app',
        "read" boolean NOT NULL DEFAULT false,
        "actionUrl" character varying,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    // ─── Table: refresh_tokens ────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "jti" character varying NOT NULL,
        "hashedToken" character varying NOT NULL,
        "familyId" character varying NOT NULL,
        "isUsed" boolean NOT NULL DEFAULT false,
        "isRevoked" boolean NOT NULL DEFAULT false,
        "expiresAt" TIMESTAMP NOT NULL,
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "refresh_tokens"
      ADD CONSTRAINT "FK_refresh_tokens_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_refresh_tokens_jti"
      ON "refresh_tokens" ("jti")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_refresh_tokens_family_id"
      ON "refresh_tokens" ("familyId")
    `);

    // ─── Table: channels ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "channels" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "type" "public"."channels_type_enum" NOT NULL DEFAULT 'public',
        "workspaceId" uuid,
        "createdById" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_channels" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "channels"
      ADD CONSTRAINT "FK_channels_workspace"
      FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "channels"
      ADD CONSTRAINT "FK_channels_created_by"
      FOREIGN KEY ("createdById") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // ─── Table: channel_members ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "channel_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "channelId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "role" "public"."channel_members_role_enum" NOT NULL DEFAULT 'member',
        "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_channel_members" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_channel_members_channel_user" UNIQUE ("channelId", "userId")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "channel_members"
      ADD CONSTRAINT "FK_channel_members_channel"
      FOREIGN KEY ("channelId") REFERENCES "channels"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "channel_members"
      ADD CONSTRAINT "FK_channel_members_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── Table: channel_messages ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "channel_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" character varying NOT NULL,
        "type" "public"."channel_messages_type_enum" NOT NULL DEFAULT 'text',
        "fileUrl" character varying,
        "replyTo" character varying,
        "channelId" uuid NOT NULL,
        "senderId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_channel_messages" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "channel_messages"
      ADD CONSTRAINT "FK_channel_messages_channel"
      FOREIGN KEY ("channelId") REFERENCES "channels"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "channel_messages"
      ADD CONSTRAINT "FK_channel_messages_sender"
      FOREIGN KEY ("senderId") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_channel_messages_channel_created_at"
      ON "channel_messages" ("channelId", "createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_channel_messages_reply_to"
      ON "channel_messages" ("replyTo")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse dependency order
    await queryRunner.query(`DROP TABLE "channel_messages"`);
    await queryRunner.query(`DROP TABLE "channel_members"`);
    await queryRunner.query(`DROP TABLE "channels"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_messages_sender_receiver"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "workspaces"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."channel_messages_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."channel_members_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."channels_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}