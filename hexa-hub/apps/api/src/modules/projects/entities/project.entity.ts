import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ nullable: true })
  modelUrl: string;

  @Column({ nullable: true })
  client: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  area: string;

  @Column({ nullable: 'array', type: 'text', nullable: true })
  services: string[];

  @Column({ default: true })
  isPublished: boolean;

  @ManyToOne(() => User)
  owner: User;

  @ManyToOne(() => Workspace)
  workspace: Workspace;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
