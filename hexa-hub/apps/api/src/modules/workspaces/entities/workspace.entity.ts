import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';
import { Channel } from '../../channels/entities/channel.entity';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  slug: string;

  @Column({ default: 'active' })
  status: 'active' | 'archived' | 'completed';

  @ManyToOne(() => User)
  owner: User;

  @ManyToOne(() => User, { nullable: true })
  client: User;

  @OneToMany(() => Task, (task) => task.workspace)
  tasks: Task[];

  @OneToMany(() => Channel, (channel) => channel.workspace)
  channels: Channel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
