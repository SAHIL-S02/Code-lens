import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

export type ReviewSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ReviewTemplate =
  | 'security'
  | 'performance'
  | 'code_quality'
  | 'documentation'
  | 'architecture';

export interface ReviewIssue {
  title: string;
  description: string;
  severity: ReviewSeverity;
  file?: string;
  line?: number;
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  title: string;

  @Column({ type: 'varchar' })
  template: ReviewTemplate;

  @Column({ type: 'simple-array', nullable: true })
  targetFiles: string[];

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'jsonb', default: [] })
  issues: ReviewIssue[];

  @Column({ type: 'jsonb', default: [] })
  recommendations: string[];

  @Column({ type: 'text', nullable: true })
  rawResponse: string;

  @CreateDateColumn()
  createdAt: Date;
}
