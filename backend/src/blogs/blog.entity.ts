import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity.js';
import { Comment } from '../comments/comment.entity.js';

export type BlogStatus = 'draft' | 'pending' | 'approved' | 'rejected';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 'draft' })
  status: BlogStatus;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column({ nullable: true, type: 'timestamp' })
  publishedAt?: Date;

  @Column({ default: 0 })
  version: number;

  @ManyToOne(() => User, (user) => user.blogs)
  author: User;

  @OneToMany(() => Comment, (comment) => comment.blog)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
