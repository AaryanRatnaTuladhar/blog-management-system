import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CacheService } from '../infrastructure/cache/cache.service.js';
import { QueueService } from '../infrastructure/queue/queue.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { User } from '../users/user.entity.js';
import { Blog } from './blog.entity.js';
import { CreateBlogDto, UpdateBlogDto } from './dto.js';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog) private readonly blogRepo: Repository<Blog>,
    private readonly dataSource: DataSource,
    private readonly queue: QueueService,
    private readonly cache: CacheService,
    private readonly notifications: NotificationsService,
  ) {}

  create(author: User, dto: CreateBlogDto) {
    return this.blogRepo.save(
      this.blogRepo.create({ ...dto, author, status: 'draft' }),
    );
  }

  listMine(userId: string) {
    return this.blogRepo.find({
      where: { author: { id: userId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(userId: string, id: string, dto: UpdateBlogDto) {
    const blog = await this.getOwned(userId, id);
    if (blog.status === 'approved')
      throw new ForbiddenException('Approved blog cannot be edited');
    await this.blogRepo.update({ id }, { ...dto, version: blog.version + 1 });
    return this.blogRepo.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async remove(userId: string, id: string) {
    const blog = await this.getOwned(userId, id);
    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        'UPDATE "comments" SET "parentCommentId" = NULL WHERE "blogId" = $1',
        [blog.id],
      );
      await manager.query('DELETE FROM "comments" WHERE "blogId" = $1', [blog.id]);
      await manager.query('DELETE FROM "blogs" WHERE "id" = $1', [blog.id]);
    });
    await this.cache.del('public:blogs');
    await this.cache.del(`public:blog:${blog.id}`);
    return { success: true };
  }

  async submit(userId: string, id: string) {
    const blog = await this.getOwned(userId, id);
    if (blog.status === 'pending') return blog;
    blog.status = 'pending';
    blog.version += 1;
    return this.blogRepo.save(blog);
  }

  async listPublic() {
    const cached = await this.cache.get<Blog[]>('public:blogs');
    if (cached) return cached;
    const blogs = await this.blogRepo.find({
      where: { status: 'approved' },
      relations: ['author'],
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
    });
    await this.cache.set('public:blogs', blogs, 120);
    return blogs;
  }

  async getPublic(id: string) {
    const key = `public:blog:${id}`;
    const cached = await this.cache.get<Blog>(key);
    if (cached) return cached;
    const blog = await this.blogRepo.findOne({
      where: { id, status: 'approved' },
      relations: ['author'],
    });
    if (!blog) throw new NotFoundException('Blog not found');
    await this.cache.set(key, blog, 120);
    return blog;
  }

  listPending() {
    return this.blogRepo.find({
      where: { status: 'pending' },
      relations: ['author'],
      order: { updatedAt: 'DESC' },
    });
  }

  listAll() {
    return this.blogRepo.find({
      relations: ['author'],
      order: { updatedAt: 'DESC' },
    });
  }

  async stats() {
    const [draft, pending, approved, rejected] = await Promise.all([
      this.blogRepo.count({ where: { status: 'draft' } }),
      this.blogRepo.count({ where: { status: 'pending' } }),
      this.blogRepo.count({ where: { status: 'approved' } }),
      this.blogRepo.count({ where: { status: 'rejected' } }),
    ]);
    return { draft, pending, approved, rejected };
  }

  async approve(id: string) {
    const blog = await this.blogRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.status === 'approved') return blog;
    blog.status = 'approved';
    blog.publishedAt = new Date();
    blog.version += 1;
    const saved = await this.blogRepo.save(blog);
    await this.cache.del('public:blogs');
    await this.cache.del(`public:blog:${id}`);
    await this.queue.publish('blog.publish', { blogId: id });
    await this.queue.publish('notification.dispatch', {
      userId: blog.author.id,
      type: 'blog_approved',
      payload: { blogId: id, title: blog.title },
    });
    await this.notifications.create(blog.author, 'blog_approved', {
      blogId: id,
      title: blog.title,
    });
    return saved;
  }

  async reject(id: string, reason?: string) {
    const blog = await this.blogRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!blog) throw new NotFoundException('Blog not found');
    blog.status = 'rejected';
    blog.rejectionReason = reason || 'Rejected by admin';
    blog.version += 1;
    const saved = await this.blogRepo.save(blog);
    await this.queue.publish('notification.dispatch', {
      userId: blog.author.id,
      type: 'blog_rejected',
      payload: { blogId: id, title: blog.title, reason: blog.rejectionReason },
    });
    await this.notifications.create(blog.author, 'blog_rejected', {
      blogId: id,
      title: blog.title,
      reason: blog.rejectionReason,
    });
    return saved;
  }

  private async getOwned(userId: string, id: string) {
    const blog = await this.blogRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.author.id !== userId) throw new ForbiddenException('Not allowed');
    return blog;
  }
}
