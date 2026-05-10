import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../blogs/blog.entity.js';
import { CacheService } from '../infrastructure/cache/cache.service.js';
import { QueueService } from '../infrastructure/queue/queue.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { User } from '../users/user.entity.js';
import { Comment } from './comment.entity.js';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(Blog) private readonly blogsRepo: Repository<Blog>,
    private readonly queue: QueueService,
    private readonly cache: CacheService,
    private readonly notifications: NotificationsService,
  ) {}

  async addComment(
    user: User,
    blogId: string | null,
    content: string,
    parentCommentId?: string,
  ) {
    let blog: Blog | null = null;
    let parentComment: Comment | undefined;
    if (parentCommentId) {
      const parent = await this.commentsRepo.findOne({
        where: { id: parentCommentId },
        relations: ['blog', 'blog.author'],
      });
      if (!parent) throw new NotFoundException('Parent comment not found');
      parentComment = parent;
      blog = parent.blog;
    } else if (blogId) {
      blog = await this.blogsRepo.findOne({
        where: { id: blogId },
        relations: ['author'],
      });
    }
    if (!blog || blog.status !== 'approved')
      throw new NotFoundException('Blog not found');
    const comment = await this.commentsRepo.save(
      this.commentsRepo.create({ content, blog, author: user, parentComment }),
    );
    await this.cache.del(`public:blog:${blog.id}`);
    await this.queue.publish('notification.dispatch', {
      userId: blog.author.id,
      type: parentCommentId ? 'blog_reply' : 'blog_comment',
      payload: { blogId: blog.id, commentId: comment.id },
    });
    if (blog.author.id !== user.id) {
      await this.notifications.create(
        blog.author,
        parentCommentId ? 'blog_reply' : 'blog_comment',
        {
          blogId: blog.id,
          commentId: comment.id,
        },
      );
    }
    return comment;
  }

  async listForBlog(blogId: string) {
    const comments = await this.commentsRepo.find({
      where: { blog: { id: blogId } },
      relations: ['parentComment', 'author'],
      order: { createdAt: 'ASC' },
    });
    const byId = new Map<string, Comment & { replies: Comment[] }>();
    comments.forEach((comment) =>
      byId.set(comment.id, { ...comment, replies: [] }),
    );
    const roots: (Comment & { replies: Comment[] })[] = [];
    byId.forEach((comment) => {
      const parentId = comment.parentComment?.id;
      if (parentId && byId.has(parentId)) {
        byId.get(parentId)?.replies.push(comment);
      } else {
        roots.push(comment);
      }
    });
    return roots;
  }

  listAll() {
    return this.commentsRepo.find({
      relations: ['blog', 'author', 'parentComment'],
      order: { createdAt: 'DESC' },
    });
  }

  async moderateRemove(id: string) {
    const comment = await this.commentsRepo.findOne({
      where: { id },
      relations: ['blog'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.deletedAt = new Date();
    comment.content = '[removed by admin]';
    await this.commentsRepo.save(comment);
    await this.cache.del(`public:blog:${comment.blog.id}`);
    return { success: true };
  }

  async remove(userId: string, id: string) {
    const comment = await this.commentsRepo.findOne({
      where: { id },
      relations: ['blog', 'author'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.id !== userId)
      throw new ForbiddenException('Not allowed');
    comment.deletedAt = new Date();
    comment.content = '[deleted]';
    await this.commentsRepo.save(comment);
    await this.cache.del(`public:blog:${comment.blog.id}`);
    return { success: true };
  }
}
