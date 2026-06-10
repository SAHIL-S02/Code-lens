import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('ai_providers')
export class AiProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.aiProviders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column()
  baseUrl: string;

  @Column({ nullable: true })
  apiKey: string;

  @Column()
  modelName: string;

  @Column({ default: true })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
