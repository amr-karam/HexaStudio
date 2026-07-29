// ─── HEXA Hub — Workspace & Task Types ──────────────────────────────────────
// TypeScript types for local (PostgreSQL/TypeORM) workspace entities.
// These are separate from Odoo project types — workspaces are local collaboration spaces.
// ───────────────────────────────────────────────────────────────────────────

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export interface WorkspaceUser {
  id: string;
  email: string;
  fullName: string;
  role?: string;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  assignee?: WorkspaceUser;
  workspace?: { id: string };
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  slug: string;
  status: 'active' | 'archived' | 'completed';
  owner: WorkspaceUser;
  client?: WorkspaceUser;
  tasks?: WorkspaceTask[];
  createdAt: string;
  updatedAt: string;
}