import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type WebhookAction = 'create' | 'update' | 'delete';
export type WebhookStatus = 'success' | 'failed' | 'pending';

@Entity('webhook_logs')
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'integer' })
  recordId: number;

  @Column({ type: 'varchar', length: 20 })
  action: WebhookAction;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: WebhookStatus;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  response: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  signature: string | null;

  @CreateDateColumn()
  @Index()
  receivedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @Column({ type: 'integer', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt: Date | null;
}
