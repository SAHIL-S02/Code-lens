import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  path: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  parentPath: string | null;

  @Column({ default: false })
  isDirectory: boolean;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ type: 'bigint', default: 0 })
  size: number;

  @CreateDateColumn()
  createdAt: Date;
}
