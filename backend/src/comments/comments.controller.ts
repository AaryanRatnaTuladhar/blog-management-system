import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateCommentDto } from './dto.js';
import { CommentsService } from './comments.service.js';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('blogs/:id/comments')
  addComment(
    @CurrentUser() user: { id: string },
    @Param('id') blogId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.addComment(
      { id: user.id } as never,
      blogId,
      dto.content,
    );
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('comments/:id/replies')
  addReply(
    @CurrentUser() user: { id: string },
    @Param('id') commentId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.addComment(
      { id: user.id } as never,
      null,
      dto.content,
      commentId,
    );
  }

  @Delete('comments/:id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.commentsService.remove(user.id, id);
  }
}

@Controller('public/blogs/:id/comments')
export class PublicCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  list(@Param('id') blogId: string) {
    return this.commentsService.listForBlog(blogId);
  }
}
