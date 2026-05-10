import { Module } from '@nestjs/common';
import { BlogsModule } from '../blogs/blogs.module.js';
import { CommentsModule } from '../comments/comments.module.js';
import { UsersModule } from '../users/users.module.js';
import { AdminController } from './admin.controller.js';

@Module({
  imports: [BlogsModule, UsersModule, CommentsModule],
  controllers: [AdminController],
})
export class AdminModule {}
