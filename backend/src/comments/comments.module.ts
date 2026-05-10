import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from '../blogs/blog.entity.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { Comment } from './comment.entity.js';
import {
  CommentsController,
  PublicCommentsController,
} from './comments.controller.js';
import { CommentsService } from './comments.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Blog]), NotificationsModule],
  providers: [CommentsService],
  controllers: [CommentsController, PublicCommentsController],
  exports: [CommentsService, TypeOrmModule],
})
export class CommentsModule {}
