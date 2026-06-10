import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { AiProvider } from './ai-provider.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @OneToMany(() => AiProvider, (provider) => provider.user)
  aiProviders: AiProvider[];
}
