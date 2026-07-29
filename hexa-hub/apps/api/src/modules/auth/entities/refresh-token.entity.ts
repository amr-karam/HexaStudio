// ─── HEXA Hub — Refresh Token Entity ────────────────────────────────────────
// Stores active refresh tokens with expiry and rotation tracking.
// Creates a new family on each login; each refresh rotates to a new child token.
// ───────────────────────────────────────────────────────────────────────────

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The JWT ID of the access token this refresh token was issued with. */
  @Column()
  @Index()
  jti: string;

  /** Hashed refresh token value (we never store raw tokens). */
  @Column()
  hashedToken: string;

  /** Token family ID — all tokens in the same family were issued by the same login. */
  @Column()
  @Index()
  familyId: string;

  /** Whether this token has been used (consumed by a refresh operation). */
  @Column({ default: false })
  isUsed: boolean;

  /** Whether this token has been revoked (logout or security event). */
  @Column({ default: false })
  isRevoked: boolean;

  /** Expiry timestamp. */
  @Column()
  expiresAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}