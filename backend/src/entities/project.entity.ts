import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { FileEntity } from './file.entity';
import { Review } from './review.entity';
import { ChatSession } from './chat-session.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => FileEntity, (file) => file.project)
  files: FileEntity[];

  @OneToMany(() => Review, (review) => review.project)
  reviews: Review[];

  @OneToMany(() => ChatSession, (session) => session.project)
  chatSessions: ChatSession[];
}
