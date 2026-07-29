import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Unique, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Channel } from './channel.entity';

export enum ChannelMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('channel_members')
@Unique(['channel', 'user'])
export class ChannelMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Channel, (channel) => channel.members, { onDelete: 'CASCADE' })
  channel: Channel;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: ChannelMemberRole, default: ChannelMemberRole.MEMBER })
  role: ChannelMemberRole;

  @CreateDateColumn()
  joinedAt: Date;
}