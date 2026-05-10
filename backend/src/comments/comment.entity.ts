import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from '../blogs/blog.entity.js';
import { User } from '../users/user.entity.js';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true, type: 'timestamp' })
  deletedAt?: Date;

  @ManyToOne(() => Blog, (blog) => blog.comments)
  blog: Blog;

  @ManyToOne(() => User, (user) => user.comments)
  author: User;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
  })
  parentComment?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];

  @CreateDateColumn()
  createdAt: Date;
}
