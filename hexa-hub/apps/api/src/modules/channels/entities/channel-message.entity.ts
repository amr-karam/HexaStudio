import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Channel } from './channel.entity';

@Entity('channel_messages')
@Index(['channel', 'createdAt'])
@Index(['replyTo'])
export class ChannelMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ type: 'enum', enum: ['text', 'image', 'file', 'system'], default: 'text' })
  type: 'text' | 'image' | 'file' | 'system';

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  replyTo: string;

  @ManyToOne(() => Channel, (channel) => channel.messages, { onDelete: 'CASCADE' })
  channel: Channel;

  @ManyToOne(() => User)
  sender: User;

  @CreateDateColumn()
  createdAt: Date;
}