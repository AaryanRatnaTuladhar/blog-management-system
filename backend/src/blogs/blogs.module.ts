import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { Blog } from './blog.entity.js';
import { BlogsController } from './blogs.controller.js';
import { BlogsService } from './blogs.service.js';
import { PublicBlogsController } from './public-blogs.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Blog]), NotificationsModule],
  providers: [BlogsService],
  controllers: [BlogsController, PublicBlogsController],
  exports: [BlogsService, TypeOrmModule],
})
export class BlogsModule {}
